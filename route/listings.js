const express= require("express");
const router= express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner,validateListing} = require("../middleware.js");
const { populate } = require("../models/review.js");




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
    const listing= await Listing.findById(id).populate( {path :"reviews",populate:{path :"author"}}).populate("owner");
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

router.put("/:id", validateListing , isLoggedIn, isOwner,
    wrapAsync(async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
     req.flash("success", "listing updated");
      return res.redirect("/listings");
}));
router.delete("/:id", isLoggedIn, isOwner,
    wrapAsync(async(req,res)=>{
    let {id}=req.params;
   let deletedata= await Listing.findByIdAndDelete(id);
   console.log(deletedata);
    req.flash("success", "listing Deleted");
    res.redirect("/listings");
}));

module.exports=router;