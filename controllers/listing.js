const Listing= require("../models/listing.js");
const { populate } = require("../models/review.js");

module.exports.index=async(req, res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id).populate( {path :"reviews",populate:{path :"author"}}).populate("owner");
    if(!listing){
        req.flash("error", "Listing requesting does not exist");
       return  res.redirect("/listings")
    }
    console.log(listing);
    res.render("./listings/show.ejs",{listing});
};

module.exports.renderNewform=(req, res)=>{
    res.render("./listings/new.ejs")
};

module.exports.Newlisting=async(req,res,next)=>{
       const newListing= new Listing(req.body.listing);
       newListing.owner= req.user._id;
    await newListing.save();
    req.flash("success", "new listing created");
    res.redirect("/listings");
    
};

module.exports.renderEditForm=async (req,res)=>{
     let {id}=req.params;
    const listing= await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing requesting does not exist");
       return  res.redirect("/listings")
    }
    res.render("./listings/edit.ejs",{listing});
};