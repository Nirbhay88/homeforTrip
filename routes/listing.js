const express = require("express");
const router=express.Router();
const wrapAsync=require("../utilities/wrapAsync.js");
const ExpressError = require("../utilities/ExpressError.js");
const{listingSchema }=require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn}=require("../middleware.js")

const validatelisting =(req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
      let errMsg= error.details.map((el)=>el.message).join(",");
      throw new ExpressError(400,errMsg);
    }
    else{
      next();
    }
  };

//Index Route
router.get("/",wrapAsync( async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
 
  }));
  
  //New Route
  router.get("/new",
    isLoggedIn,
     wrapAsync((req, res) => {
  
    res.render("listings/new.ejs");
   
  }));
  
  //Show Route
  router.get("/:id",wrapAsync( async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    if(!listing){
      req.flash("error","this listing was deleted");
      res.redirect("/listings");
   
    }
    res.render("listings/show.ejs", { listing });
   
  }));
  
  //Create Route
 router.post("/",
  isLoggedIn,
    //validatelisting,
     wrapAsync(async (req, res ,) => {
      
      const newListing = new Listing(req.body.listing);
       newListing.owner=req.user._id;
      await newListing.save();
      req.flash("success","New Listing Created");
      res.redirect("/listings");
  }));
  
  //Edit Route
  router.get("/:id/edit", 
    isLoggedIn,
    wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error","this listing was deleted");
      res.redirect("/listings");
   
    }
    res.render("listings/edit.ejs", { listing });
  
  }));
  
  //Update Route
  router.put("/:id", 
    isLoggedIn,
   //validatelisting,
    wrapAsync(async (req, res) => {
      if(!req.body.listing){
        throw new ExpressError(400,"Send valid data for Listing")
      }
    let { id } = req.params;
    console.log(req.body.listing);
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success","Updated");
    res.redirect(`/listings/${id}`);
    
  
 
  }));
  
  //Delete Route
  router.delete("/:id",
    isLoggedIn,
     wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success"," Listing Deleted");
    res.redirect("/listings");
  
  }));


  module.exports = router;