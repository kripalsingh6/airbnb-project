const Listing = require("./models/listing");
const ExpressError = require("./utils/expressError.js");
const {listingSchema}= require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create a listing");
    return res.redirect("/login");
  }
  next();
};

module.exports.savedRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  if (!listing.owner.equals(res.locals.currUser_id)) {
    req.flash("error", "You don't have permission to edit");
    return res.redirect(`/listings/${id}`);
  }

  next();
};


module.exports. validateListing = (req,res,next)=>{
let {error}= listingSchema.validate(req.body);
   console.log(error);
   if(error){
    let errmsg= error.details.map((el)=> el.message).join(",");
    throw new ExpressError(400, errmsg);
   }else{
    next();
   }
};