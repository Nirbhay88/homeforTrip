const express = require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utilities/wrapAsync.js");
const ExpressError = require("../utilities/ExpressError.js");
const{reviewSchema}=require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

//validateSchema for review on serversite
const validateReviews =(req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
       let errMsg= error.details.map((el)=>el.message).join(",");
      throw new ExpressError(400,errMsg);
    }
    else{
      next();
    }
  }

//review route
router.post("/" , 
    validateReviews,
    wrapAsync (async(req,res)=>{
      //the id is not 
    let { id } = req.params;
    const listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
  
    listing.reviews.push(newReview);
  
    await newReview.save();
    await listing.save();
  
    console.log("saved");
    req.flash("success","New Review Created");
    res.redirect(`/listings/${id}`);
  
  }));
  //Delete review route
router.delete("/:reviewId",
    wrapAsync(async(req,res)=>{
  let {id,reviewId}=req.params;
  await Listing.findByIdAndUpdate(id,{
    $pull:{reviews:reviewId}
  });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success","review Deleted");
  res.redirect(`/listings/${id}`);
  }));

  module.exports=router;
  