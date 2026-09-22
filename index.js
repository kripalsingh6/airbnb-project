import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}


import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import ejsmate from "ejs-mate";
import ExpressError from "./utils/expressError.js";
import listingRouter from "./route/listings.js";
import reviewRouter from "./route/review.js";
import userRouter from "./route/user.js";
import session from "express-session";
import flash from "connect-flash";
import passport from "passport";
import LocalStrategy from "passport-local";
import User from "./models/user.js";
import methodoverride from "method-override";
import MongoStore from "connect-mongo";
import configureGoogleAuth from "./config/googleAuthConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8080;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine('ejs', ejsmate);
app.use(methodoverride("_method"));

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/Project";

async function main() {
    await mongoose.connect(dbUrl);
}

main()
.then(() => {
    console.log("mongodb connected");
})
.catch((err) => {
    console.log(err);
});


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET || "mysupersecretstring",
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

let sessionsoption = {
    store,
    secret: process.env.SECRET || "mysupersecretstring", 
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true
    }
};

app.use(session(sessionsoption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
configureGoogleAuth();

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    res.locals.showUsernamePrompt = req.session && req.session.showUsernamePrompt ? true : false;
    if (req.session) {
        delete req.session.showUsernamePrompt;
    }
    res.locals.wishlistIds = req.user && req.user.wishlist ? req.user.wishlist.map(id => id.toString()) : [];
    res.locals.searchQuery = req.query.q || "";
    res.locals.checkIn = req.query.checkIn || "";
    res.locals.checkOut = req.query.checkOut || "";
    res.locals.guests = req.query.guests || "";
    next();
});

// app.get("/fakeuser", async (req,res)=>{
//     let fakeuser= new User({
//         email : "student@gmail.com",
//         username: "college-student"
//     });

//    let registereduser=await User.register(fakeuser,"helloworld");
//    res.send(registereduser);
// });

app.get("/", (req, res) => {
    res.redirect("/listings");
});
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/", userRouter);


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