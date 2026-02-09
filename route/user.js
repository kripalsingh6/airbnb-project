const express= require("express");
const router= express.Router();

const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");
const UserController= require("../controllers/users.js");

router.get("/signup",UserController.RenderSignup);

router.post("/signup", wrapAsync (UserController.ShowSignup));

router.get("/login",UserController.RenderLogin);

router.post("/login", savedRedirectUrl,
    passport.authenticate
    ("local",{failureRedirect: "/login" , failureFlash:true}),
   UserController.CreateLogin);

//logout
router.get("/logout",UserController.Logout);

module.exports= router;