const express= require("express");
const app= express();
const port = 8080;
const mongoose= require("mongoose");
const path= require("path");
const ejsmate=require("ejs-mate");
const wrapAsync= require("./utils/wrapAsync.js")
const ExpressError = require("./utils/expressError.js");
const {listingSchema,reviewSchema}= require("./schema.js");

app.set("views", path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended : true}));
app.engine('ejs', ejsmate);

const methodoverride= require("method-override");
app.use(methodoverride("_method"));

const Listing = require("./models/listing.js");
const Review= require("./models/review.js");
const { AsyncLocalStorage } = require("async_hooks");

main()
.then(()=>{
console.log("mongodb connected");
})
.catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/Project");
}

app.get("/",(req, res)=>{
    res.send("Working");
})
// app.get("/schematesting",async (req,res)=>{
//     let sampletesting= new Listing({
//         title: "my new hotel",
//         description: "it is located at bandra ",
//         price:3000,
//         location:"mumbai, maharastra",
//         country:"india",
//     });

//     await sampletesting.save();
//     console.log("sample was saved");
//     res.send("sample testing successful");

// });
const validateListing = (req,res,next)=>{
let {error}= listingSchema.validate(req.body);
   console.log(error);
   if(error){
    let errmsg= error.details.map((el)=> el.message).join(",");
    throw new ExpressError(400, errmsg);
   }else{
    next();
   }
}
//review validation
const validateReview = (req,res,next)=>{
let {error}= reviewSchema.validate(req.body);
   console.log(error);
   if(error){
    let errmsg= error.details.map((el)=> el.message).join(",");
    throw new ExpressError(400, errmsg);
   }else{
    next();
   }
}
// Index route
app.get("/listings",async (req,res)=>{
  let allListing= await Listing.find({});
  res.render("./listings/index.ejs",{allListing});

});

//new route
app.get("/listings/new",(req, res)=>{
    res.render("./listings/new.ejs")
});

//show route

app.get("/listings/:id",wrapAsync(async(req, res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id).populate("reviews");
    res.render("./listings/show.ejs",{listing});
}));

app.post("/listings",validateListing, wrapAsync(async(req,res,next)=>{
       const newListing= new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    
}));
//Edit
app.get("/listings/:id/edit",
    wrapAsync(async (req,res)=>{
     let {id}=req.params;
    const listing= await Listing.findById(id);
    res.render("./listings/edit.ejs",{listing});
}));

app.put("/listings/:id", validateListing ,
    wrapAsync(async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect("/listings");
}));
app.delete("/listings/:id",
    wrapAsync(async(req,res)=>{
    let {id}=req.params;
   let deletedata= await Listing.findByIdAndDelete(id);
   console.log(deletedata);
    res.redirect("/listings");
}));

// review 
// post request

app.post("/listings/:id/reviews",validateReview , wrapAsync(async (req , res)=>{
  let listing= await Listing.findById(req.params.id);
  let newreview= new Review(req.body.review);

   listing.reviews.push(newreview);

  await newreview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
}));

// delete review status
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res)=>{
    let {id, reviewId}= req.params;
    Listing.findByIdAndUpdate(id, {$pull : {reviews: reviewId}});

    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));

app.all(/.*/,(req,res,next)=>{
    next(new ExpressError(404,"Page not found"))
})

app.use((err,req,res,next)=>{
    let{statusCode=500,message="something went wrong"}=err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{message});
});

app.listen(port,()=>{
    console.log(`port is listening ${port}`);
});