import Listing from "./models/listing.js";
import Review from "./models/review.js";
import ExpressError from "./utils/expressError.js";
import { listingSchema, reviewSchema } from "./schema.js";

export const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    if (req.xhr || req.headers.accept?.includes("application/json") || req.path.startsWith("/user/update-username")) {
      return res.status(401).json({ success: false, message: "You must be logged in to perform this action." });
    }
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to perform this action");
    return res.redirect("/login");
  }
  next();
};

export const savedRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

export const isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  if (!listing.owner || !listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have permission to edit");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

export const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};

export const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};

export const isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${id}`);
  }

  if (!review.author || !review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not author of this review");
    return res.redirect(`/listings/${id}`);
  }

  next();
};