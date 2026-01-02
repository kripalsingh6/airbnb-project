const mongoose= require("mongoose");
const schema = mongoose.Schema;
const Review = require("./review.js");
const listingSchema= new schema({
    title:{
        type:String,
        required:true,
    },
    description: {
         type:String,
    },
    image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default: "https://unsplash.com/photos/gray-wooden-house-178j8tJrNlc",
      set: (v) =>
        v.trim() === " "
          ? "https://unsplash.com/photos/gray-wooden-house-178j8tJrNlc"
          : v,
    },
  },
    price:{
        type:Number,
    },
    location:{
        type:String,
        required: true,
    },
    country:{
        type: String,
        required:true,
    },
    reviews:[{
      type: schema.Types.ObjectId,
      ref: "Review",
    }]

});
listingSchema.post("findOneAndDelete", async (listing)=>{
  if(listing){
  await Review.deleteMany({id_ : {$in : listing.reviews}});
  };
});

const Listing= mongoose.model("Listing",listingSchema);
module.exports= Listing;