const express= require("express");
const router= express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner,validateListing} = require("../middleware.js");
const { populate } = require("../models/review.js");
const listingController= require("../controllers/listing.js");

router.get("/",async (req,res)=>{
  let allListing= await Listing.find({});
  res.render("./listings/index.ejs",{allListing});

});
//new route
router.get("/new", isLoggedIn,listingController.renderNewform);
//show route
router.get("/:id",wrapAsync( listingController.index));

router.post("/",validateListing,isLoggedIn, wrapAsync(listingController.Newlisting));
//Edit
router.get("/:id/edit", isLoggedIn,
    wrapAsync(listingController.renderEditForm));

router.put("/:id", validateListing , isLoggedIn, isOwner,
    wrapAsync(listingController.editListing));

router.delete("/:id", isLoggedIn, isOwner,
    wrapAsync(listingController.Deletelisting));

module.exports=router;