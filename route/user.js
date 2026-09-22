import express from "express";
import passport from "passport";
import wrapAsync from "../utils/wrapAsync.js";
import Booking from "../models/booking.js";
import User from "../models/user.js";
import Listing from "../models/listing.js";
import { savedRedirectUrl, isLoggedIn } from "../middleware.js";
import * as UserController from "../controllers/users.js";

const router = express.Router();


router.route("/signup")
  .get(UserController.RenderSignup)
  .post(savedRedirectUrl, wrapAsync(UserController.ShowSignup));

router.route("/login")
  .get(UserController.RenderLogin)
  .post(
    savedRedirectUrl,
    passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
    UserController.CreateLogin
  );

// Google OAuth Routes
router.get(
  "/auth/google",
  (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === "your_google_client_id_here") {
      req.flash("error", "Google OAuth credentials are not configured in .env yet. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
      return res.redirect("/login");
    }
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
);

router.get(
  "/auth/google/callback",
  savedRedirectUrl,
  passport.authenticate("google", { failureRedirect: "/login", failureFlash: true }),
  UserController.GoogleCallback
);

// logout
router.get("/logout", UserController.Logout);

// Update Username
router.post("/user/update-username", isLoggedIn, wrapAsync(UserController.UpdateUsername));

// My Bookings / Trips
router.get("/bookings", isLoggedIn, wrapAsync(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });
  res.render("bookings/index.ejs", { bookings });
}));

router.get("/trips", isLoggedIn, (req, res) => {
  res.redirect("/bookings");
});

// Wishlists Page
router.get("/wishlists", wrapAsync(async (req, res) => {
  let wishlistListings = [];
  if (req.user) {
    const user = await User.findById(req.user._id).populate("wishlist");
    wishlistListings = user && user.wishlist ? user.wishlist : [];
  }
  res.render("wishlists/index.ejs", { wishlistListings });
}));

router.get("/wishlist", (req, res) => {
  res.redirect("/wishlists");
});

// Wishlists Toggle API
router.post("/wishlists/toggle/:id", wrapAsync(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Please log in to save to wishlist." });
  }

  const { id } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  const strId = id.toString();
  const index = user.wishlist.findIndex(item => item.toString() === strId);
  let isLiked = false;

  if (index > -1) {
    user.wishlist.splice(index, 1);
    isLiked = false;
  } else {
    user.wishlist.push(id);
    isLiked = true;
  }

  await user.save();
  res.json({ success: true, isLiked, count: user.wishlist.length });
}));

export default router;