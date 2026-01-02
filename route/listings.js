const express= require("express");
const router= express.Router();
const wrapAsync= require("../utils/wrapAsync.js")
const ExpressError = require("../utils/expressError.js");
const {listingSchema,reviewSchema}= require("../schema.js");
const Listing = require("../models/listing.js");

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
router.get("/new",(req, res)=>{
    res.render("./listings/new.ejs")
});

//show route

router.get("/:id",wrapAsync(async(req, res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id).populate("reviews");
    res.render("./listings/show.ejs",{listing});
}));

router.post("/",validateListing, wrapAsync(async(req,res,next)=>{
       const newListing= new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    
}));
//Edit
router.get("/:id/edit",
    wrapAsync(async (req,res)=>{
     let {id}=req.params;
    const listing= await Listing.findById(id);
    res.render("./listings/edit.ejs",{listing});
}));

router.put("/:id", validateListing ,
    wrapAsync(async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect("/listings");
}));
router.delete("/:id",
    wrapAsync(async(req,res)=>{
    let {id}=req.params;
   let deletedata= await Listing.findByIdAndDelete(id);
   console.log(deletedata);
    res.redirect("/listings");
}));

module.exports=router;