const express= require("express");
const router= express.Router({mergeParams:true});
const wrapAsync= require("../utils/wrapAsync.js")
const ExpressError = require("../utils/expressError.js");
const {reviewSchema}= require("../schema.js");
const Review= require("../models/review.js");
const Listing = require("../models/listing.js");
const{isLoggedIn,validateReview, isReviewAuthor}=require("../middleware.js")


// review 
// post request

router.post("/",validateReview , isLoggedIn ,validateReview, wrapAsync(async (req , res)=>{
  let listing= await Listing.findById(req.params.id);
  let newreview= new Review(req.body.review);
    newreview.author= req.user._id;
    console.log(newreview);
   listing.reviews.push(newreview);

  await newreview.save();
  await listing.save();

   req.flash("success", "Review updated");
  res.redirect(`/listings/${listing._id}`);
}));

// delete review status
router.delete("/:reviewId",  isLoggedIn , isReviewAuthor,wrapAsync(async(req,res)=>{
    let {id, reviewId}= req.params;
   await Listing.findByIdAndUpdate(id, {$pull : {reviews: reviewId}});  //$pull

    await Review.findByIdAndDelete(reviewId);
     req.flash("success", " Review Deleted ");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;