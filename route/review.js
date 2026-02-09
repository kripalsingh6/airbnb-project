const express= require("express");
const router= express.Router({mergeParams:true});
const wrapAsync= require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const{isLoggedIn,validateReview, isReviewAuthor}=require("../middleware.js")
const ReviewController= require("../controllers/reviews.js");


// review 
// post request
router.post("/",validateReview , isLoggedIn ,validateReview, wrapAsync(ReviewController.CreateReview));

// delete review status
router.delete("/:reviewId",  isLoggedIn , isReviewAuthor,wrapAsync(ReviewController.DeleteReview));

module.exports = router;