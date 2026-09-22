import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { isLoggedIn, validateReview, isReviewAuthor } from "../middleware.js";
import * as ReviewController from "../controllers/reviews.js";

const router = express.Router({ mergeParams: true });

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

export default router;