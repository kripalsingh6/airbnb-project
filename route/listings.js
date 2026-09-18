const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
  .get(wrapAsync(async (req, res) => {
    let { q, category, checkIn, checkOut, guests } = req.query;
    let filter = {};

    if (q && q.trim()) {
      let queryStr = q.trim();
      let searchCity = queryStr.split(",")[0].trim();
      let orConditions = [
        { title: { $regex: searchCity, $options: "i" } },
        { location: { $regex: searchCity, $options: "i" } },
        { country: { $regex: searchCity, $options: "i" } },
        { description: { $regex: searchCity, $options: "i" } },
      ];

      // Support searching by exact MongoDB ObjectId (_id)
      const mongoose = require("mongoose");
      if (mongoose.Types.ObjectId.isValid(queryStr) && queryStr.length === 24) {
        orConditions.push({ _id: queryStr });
      }

      filter.$or = orConditions;
    }

    if (guests) {
      const numGuests = parseInt(guests, 10);
      if (!isNaN(numGuests) && numGuests > 0) {
        const guestCondition = [
          { guests: { $gte: numGuests } },
          { guests: { $exists: false } },
        ];
        if (filter.$or) {
          filter = {
            $and: [
              { $or: filter.$or },
              { $or: guestCondition }
            ]
          };
        } else {
          filter.$or = guestCondition;
        }
      }
    }

    if (category && category.trim()) {
      let catRegex = new RegExp(category.trim(), "i");
      const catCondition = [
        { title: catRegex }, 
        { description: catRegex }, 
        { location: catRegex }, 
        { propertyType: catRegex }
      ];

      if (filter.$and) {
        filter.$and.push({ $or: catCondition });
      } else if (filter.$or) {
        filter = {
          $and: [
            { $or: filter.$or },
            { $or: catCondition }
          ]
        };
      } else {
        filter = { $or: catCondition };
      }
    }

    let allListing = await Listing.find(filter);
    res.render("./listings/index.ejs", { 
      allListing, 
      searchQuery: q ? q.trim() : "", 
      activeCategory: category ? category.trim() : "",
      checkIn: checkIn ? checkIn.trim() : "",
      checkOut: checkOut ? checkOut.trim() : "",
      guests: guests ? guests.trim() : "",
    });
  }))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.Newlisting)
  );

// new route
router.get("/new", isLoggedIn, listingController.renderNewform);

// show, update, delete routes
router.route("/:id")
  .get(wrapAsync(listingController.index))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.editListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.Deletelisting)
  );

// edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

// book routes
router.route("/:id/book")
  .get(isLoggedIn, wrapAsync(listingController.renderBookForm))
  .post(isLoggedIn, wrapAsync(listingController.createBooking));

// Razorpay payment routes
router.post("/:id/create-order", isLoggedIn, wrapAsync(listingController.createPaymentOrder));
router.post("/:id/verify-payment", isLoggedIn, wrapAsync(listingController.verifyPayment));

module.exports = router;