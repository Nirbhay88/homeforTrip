const express = require("express");
const router=express.Router({mergeParams:true});
const User = require("../models/user.js");
const wrapAsync = require("../utilities/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup" , (req,res)=>{
    res.render("users/signup.ejs");
});

router.post("/signup",wrapAsync(async(req,res)=>{
    try{
        let {username,email,password}=req.body;
        const newUser = new User ({email,username});
        const registerdUser = await User.register(newUser,password);
        req.login(registerdUser,(err)=>{
           if(err){
                next(err); 
            }
            req.flash("success","User is registered");
            res.redirect("/listings");
            
            })
     
}catch(e){
       req.flash("error" , e.message);
       res.redirect("/signup");
    }
    
}))

router.get("/login" , (req,res)=>{
    res.render("users/login.ejs");
});
router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local",{
        failureRedirect:"/login",
        failureFlash:true,
    }),
    async(req,res)=>{
        req.flash("success","welcome back")
        let redirectUrl = res.locals.redirectUrl||"/listings"
        res.redirect(redirectUrl);
    }
)
router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err); 
        }
        req.flash("success","Successfully Logout");
        res.redirect("/listings");
    });
})




module.exports= router;