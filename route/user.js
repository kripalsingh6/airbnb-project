const express= require("express");
const router= express.Router();
const User= require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");

router.get("/signup",(req,res)=>{
    res.render("./user/signup.ejs")
});

router.post("/signup", wrapAsync (async (req,res)=>{
    try{
       let {username,email, password}= req.body;
 const newUser= new User({username, email});
 const registerUser= await User.register(newUser, password);
 console.log(registerUser);
 req.login(registerUser,(er)=>{
        if(er){
            return next(er);
        }
        req.flash("success"," welcome wanderlust");
        res.redirect("/listings");
    });
 }
 catch(er){
    req.flash("error",er.message);
    res.redirect("/signup");
 }
}));

router.get("/login",(req,res)=>{
    res.render("./user/login.ejs");
});

router.post("/login", savedRedirectUrl,
    passport.authenticate
    ("local",{failureRedirect: "/login" , failureFlash:true}),
    (req,res)=>{
 req.flash("success", "welcomeback to wanderlust");
 let savedUrl= res.locals.redirectUrl || "/listings"
 res.redirect(savedUrl);
});

//logout
router.get("/logout",(req,res,next)=>{
    req.logOut((er)=>{
        if(er){
            return next(er);
        }
        req.flash("success"," you logged out");
        res.redirect("/listings");
    })
})

module.exports= router;