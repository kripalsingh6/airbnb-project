const express= require("express");
const router= express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner,validateListing} = require("../middleware.js");
const { populate } = require("../models/review.js");
const listingController= require("../controllers/listing.js");
const multer  = require('multer');
const {storage}= require("../cloudConfig.js");
const upload = multer({ storage });



router.route("/")
.get(async (req,res)=>{
  let allListing= await Listing.find({});
  res.render("./listings/index.ejs",{allListing});
})
 .post(validateListing,isLoggedIn, upload.single('listing[image]'),wrapAsync(listingController.Newlisting));
// .post( upload.single('listing[image]'),(req,res)=>{
//     res.send(req.file);
    
// })

//new route
router.get("/new", isLoggedIn,listingController.renderNewform);


//show route
router.route("/:id")
.get(wrapAsync( listingController.index))

.put( validateListing , isLoggedIn, isOwner,
    wrapAsync(listingController.editListing))

.delete( isLoggedIn, isOwner,
    wrapAsync(listingController.Deletelisting));

//Edit
router.get("/:id/edit", isLoggedIn,
    wrapAsync(listingController.renderEditForm));



module.exports=router;