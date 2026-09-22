import User from "../models/user.js";
import { sendWelcomeEmail } from "../config/emailConfig.js";

export const RenderSignup = (req, res) => {
  res.render("./user/signup.ejs");
};

export const ShowSignup = async (req, res, next) => {
  try {
    let { firstName, lastName, username, email, password, dob, promotionsOptOut } = req.body;

    // Use legal first and last name to form display name instead of gmail username
    let baseName = "";
    if (firstName && firstName.trim()) {
      baseName = `${firstName.trim()} ${lastName ? lastName.trim() : ""}`.trim();
    } else if (username && username.trim()) {
      baseName = username.trim();
    } else if (email) {
      baseName = email.split("@")[0];
    } else {
      baseName = "Guest User";
    }

    let finalUsername = baseName;
    let counter = 1;
    while (await User.findOne({ username: finalUsername })) {
      counter++;
      finalUsername = `${baseName} ${counter}`;
    }

    const newUser = new User({
      username: finalUsername,
      email: email ? email.trim().toLowerCase() : "",
      firstName: firstName ? firstName.trim() : undefined,
      lastName: lastName ? lastName.trim() : undefined,
      dob: dob ? new Date(dob) : undefined,
      promotionsOptOut: !!promotionsOptOut,
    });

    const registerUser = await User.register(newUser, password);

    // Send welcome greetings email asynchronously via Resend
    if (newUser.email) {
      sendWelcomeEmail({
        to: newUser.email,
        name: newUser.firstName || finalUsername,
        username: finalUsername,
      }).catch((err) => console.error("[Resend Email] Background delivery notice:", err));
    }
    let savedUrl = res.locals.redirectUrl || req.session.redirectUrl || "/listings";
    delete req.session.redirectUrl;
    req.login(registerUser, (er) => {
      if (er) {
        return next(er);
      }
      if (req.session) {
        req.session.showUsernamePrompt = true;
      }
      req.flash("success", `Welcome to Wanderlust, ${finalUsername}!`);
      res.redirect(savedUrl);
    });
  } catch (er) {
    req.flash("error", er.message);
    res.redirect("/signup");
  }
};

export const RenderLogin = (req, res) => {
  res.render("./user/login.ejs");
};

export const CreateLogin = (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");
  let savedUrl = res.locals.redirectUrl || req.session.redirectUrl || "/listings";
  delete req.session.redirectUrl;
  res.redirect(savedUrl);
};

export const GoogleCallback = (req, res) => {
  const displayName = (req.user && (req.user.firstName || req.user.username)) || "User";
  req.flash("success", `Welcome to Wanderlust, ${displayName}!`);
  let savedUrl = res.locals.redirectUrl || req.session.redirectUrl || "/listings";
  delete req.session.redirectUrl;
  res.redirect(savedUrl);
};

export const UpdateUsername = async (req, res) => {
  try {
    let { username } = req.body;
    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, message: "Username cannot be empty." });
    }
    username = username.trim();

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ success: false, message: "Username must be between 3 and 30 characters." });
    }

    // Check if another user already has this username (case-insensitive)
    const escaped = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existing = await User.findOne({
      username: { $regex: new RegExp(`^${escaped}$`, "i") },
      _id: { $ne: req.user._id },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This username is already taken. Please choose another one.",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.username = username;
    await user.save();

    // Update passport session user
    if (req.user) {
      req.user.username = username;
    }

    return res.json({
      success: true,
      message: "Username updated successfully!",
      username: user.username,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to update username." });
  }
};

export const Logout = (req, res, next) => {
  req.logOut((er) => {
    if (er) {
      return next(er);
    }
    req.flash("success", "You logged out successfully");
    res.redirect("/listings");
  });
};