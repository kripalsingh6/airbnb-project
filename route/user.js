const express= require("express");
const router= express.Router();

const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");
const UserController= require("../controllers/users.js");


router.route("/signup")
.get(UserController.RenderSignup)

.post( wrapAsync (UserController.ShowSignup));

router.route("/login")
.get(UserController.RenderLogin)

.post( savedRedirectUrl,
    passport.authenticate
    ("local",{failureRedirect: "/login" , failureFlash:true}),
   UserController.CreateLogin);

//logout
router.get("/logout",UserController.Logout);

module.exports= router;