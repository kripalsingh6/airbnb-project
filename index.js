if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const path = require("path");
const ejsmate = require("ejs-mate");
const ExpressError = require("./utils/expressError.js");
const listingRouter = require("./route/listings.js");
const reviewRouter = require("./route/review.js");
const userRouter = require("./route/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine('ejs', ejsmate);

const methodoverride = require("method-override");
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

const connectMongo = require("connect-mongo");
const MongoStore = connectMongo.default || connectMongo.MongoStore;

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

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
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