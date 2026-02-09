const User= require("../models/user.js");

module.exports.RenderSignup=(req,res)=>{
    res.render("./user/signup.ejs")
};

module.exports.ShowSignup=async (req,res)=>{
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
};

module.exports.RenderLogin=(req,res)=>{
    res.render("./user/login.ejs");
};

module.exports.CreateLogin= (req,res)=>{
 req.flash("success", "welcomeback to wanderlust");
 let savedUrl= res.locals.redirectUrl || "/listings"
 res.redirect(savedUrl);
};

module.exports.Logout=(req,res,next)=>{
    req.logOut((er)=>{
        if(er){
            return next(er);
        }
        req.flash("success"," you logged out");
        res.redirect("/listings");
    })
};