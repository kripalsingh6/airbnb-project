const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware.js");
const ReviewController = require("../controllers/reviews.js");

// create review
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(ReviewController.CreateReview)
);

// delete review
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(ReviewController.DeleteReview)
);

module.exports = router;