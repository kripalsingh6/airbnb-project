import Review from "../models/review.js";
import Listing from "../models/listing.js";

export const CreateReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newreview = new Review(req.body.review);
  newreview.author = req.user._id;
  console.log(newreview);
  listing.reviews.push(newreview);

  await newreview.save();
  await listing.save();

  req.flash("success", "Review updated");
  res.redirect(`/listings/${listing._id}`);
};

export const DeleteReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review Deleted");
  res.redirect(`/listings/${id}`);
};