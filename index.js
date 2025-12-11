const express= require("express");
const app= express();
const port = 8080;
const mongoose= require("mongoose");
const path= require("path");
app.set("views", path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended : true}));

const Listing = require("./models/listing.js");

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

app.get("/listings/:id",async(req, res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id);
    res.render("./listings/show.ejs",{listing});
})

app.post("/listings", async(req,res)=>{
    const newListing= new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})


app.listen(port,()=>{
    console.log(`port is listening ${port}`);
});