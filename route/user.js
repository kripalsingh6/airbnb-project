const express= require("express");
const router= express.Router();

const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const Booking = require("../models/booking.js");
const { savedRedirectUrl, isLoggedIn } = require("../middleware.js");
const UserController = require("../controllers/users.js");

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

// logout
router.get("/logout", UserController.Logout);

const User = require("../models/user.js");
const Listing = require("../models/listing.js");

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

module.exports = router;