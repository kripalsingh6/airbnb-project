const express= require("express");
const app= express();
const port = 8080;
const mongoose= require("mongoose");
const path= require("path");
const ejsmate=require("ejs-mate");
const ExpressError = require("./utils/expressError.js");
const listings = require("./route/listings.js");
const reviews = require("./route/review.js");
const session= require("express-session");
const flash= require("connect-flash");
const passport= require("passport");
const locatStrategy= require("passport-local");
const User= require("./models/user.js");

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

let sessionsoption= {secret : "mysupersecretstring", 
    resave: false ,
    saveUninitialized : true,
    cookie: {
        expires:Date.now()+ 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true
    }
};

app.use(session(sessionsoption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.get("/fakeuser", async (req,res)=>{
    let fakeuser= new User({
        email : "student@gmail.com",
        username: "college-student"
    });

   let registereduser=await User.register(fakeuser,"helloworld");
   res.send(registereduser);
})

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