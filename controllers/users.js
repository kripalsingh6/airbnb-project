const User = require("../models/user.js");

module.exports.RenderSignup = (req, res) => {
  res.render("./user/signup.ejs");
};

module.exports.ShowSignup = async (req, res, next) => {
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
    let savedUrl = res.locals.redirectUrl || req.session.redirectUrl || "/listings";
    delete req.session.redirectUrl;
    req.login(registerUser, (er) => {
      if (er) {
        return next(er);
      }
      req.flash("success", `Welcome to Wanderlust, ${finalUsername}!`);
      res.redirect(savedUrl);
    });
  } catch (er) {
    req.flash("error", er.message);
    res.redirect("/signup");
  }
};

module.exports.RenderLogin = (req, res) => {
  res.render("./user/login.ejs");
};

module.exports.CreateLogin = (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");
  let savedUrl = res.locals.redirectUrl || req.session.redirectUrl || "/listings";
  delete req.session.redirectUrl;
  res.redirect(savedUrl);
};

module.exports.Logout = (req, res, next) => {
  req.logOut((er) => {
    if (er) {
      return next(er);
    }
    req.flash("success", "You logged out successfully");
    res.redirect("/listings");
  });
};