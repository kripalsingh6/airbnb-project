const express= require("express");
const router= express.Router({mergeParams:true});
const wrapAsync= require("../utils/wrapAsync.js")
const ExpressError = require("../utils/expressError.js");
const {reviewSchema}= require("../schema.js");
const Review= require("../models/review.js");
const Listing = require("../models/listing.js");

const validateReview = (req,res,next)=>{
let {error}= reviewSchema.validate(req.body);
   console.log(error);
   if(error){
    let errmsg= error.details.map((el)=> el.message).join(",");
    throw new ExpressError(400, errmsg);
   }else{
    next();
   }
};

// review 
// post request

router.post("/",validateReview , wrapAsync(async (req , res)=>{
  let listing= await Listing.findById(req.params.id);
  let newreview= new Review(req.body.review);

   listing.reviews.push(newreview);

  await newreview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
}));

// delete review status
router.delete("/:reviewId", wrapAsync(async(req,res)=>{
    let {id, reviewId}= req.params;
    Listing.findByIdAndUpdate(id, {$pull : {reviews: reviewId}});  //$pull

    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));

module.exports = router;