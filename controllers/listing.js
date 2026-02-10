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

    let url= req.file.path;
    let filename= req.file.filename;
       const newListing= new Listing(req.body.listing);
       newListing.owner= req.user._id;
       newListing.image= {url,filename};
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

module.exports.editListing=async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
     req.flash("success", "listing updated");
      return res.redirect("/listings");
};

module.exports.Deletelisting=async(req,res)=>{
    let {id}=req.params;
   let deletedata= await Listing.findByIdAndDelete(id);
   console.log(deletedata);
    req.flash("success", "listing Deleted");
    res.redirect("/listings");
};