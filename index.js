const express= require("express");
const app= express();
const port = 8080;
const mongoose= require("mongoose");
const path= require("path");
const ejsmate=require("ejs-mate");
const ExpressError = require("./utils/expressError.js");
const listings = require("./route/listings.js");
const reviews = require("./route/review.js");

app.set("views", path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended : true}));
app.engine('ejs', ejsmate);

const methodoverride= require("method-override");
app.use(methodoverride("_method"));

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
});
app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);

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
//review validation