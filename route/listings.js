const express= require("express");
const router= express.Router();
const wrapAsync= require("../utils/wrapAsync.js")
const ExpressError = require("../utils/expressError.js");
const {listingSchema}= require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn} = require("../middleware.js");
const validateListing = (req,res,next)=>{
let {error}= listingSchema.validate(req.body);
   console.log(error);
   if(error){
    let errmsg= error.details.map((el)=> el.message).join(",");
    throw new ExpressError(400, errmsg);
   }else{
    next();
   }
};


router.get("/",async (req,res)=>{
  let allListing= await Listing.find({});
  res.render("./listings/index.ejs",{allListing});

});

//new route
router.get("/new", isLoggedIn,(req, res)=>{
    res.render("./listings/new.ejs")
});

//show route

router.get("/:id",wrapAsync(async(req, res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id).populate("reviews").populate("owner");
    if(!listing){
        req.flash("error", "Listing requesting does not exist");
       return  res.redirect("/listings")
    }
    console.log(listing);
    res.render("./listings/show.ejs",{listing});
}));

router.post("/",validateListing,isLoggedIn, wrapAsync(async(req,res,next)=>{
       const newListing= new Listing(req.body.listing);
       newListing.owner= req.user._id;
    await newListing.save();
    req.flash("success", "new listing created");
    res.redirect("/listings");
    
}));
//Edit
router.get("/:id/edit", isLoggedIn,
    wrapAsync(async (req,res)=>{
     let {id}=req.params;
    const listing= await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing requesting does not exist");
       return  res.redirect("/listings")
    }
    res.render("./listings/edit.ejs",{listing});
}));

router.put("/:id", validateListing , isLoggedIn,
    wrapAsync(async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
     req.flash("success", "listing updated");
    res.redirect("/listings");
}));
router.delete("/:id", isLoggedIn,
    wrapAsync(async(req,res)=>{
    let {id}=req.params;
   let deletedata= await Listing.findByIdAndDelete(id);
   console.log(deletedata);
    req.flash("success", "listing Deleted");
    res.redirect("/listings");
}));

module.exports=router;