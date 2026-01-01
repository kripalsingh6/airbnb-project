const mongoose= require("mongoose");
const schema = mongoose.Schema;

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
    review:[{
      type: schema.Types.ObjectId,
      ref: "Review",
    }]

});
const Listing= mongoose.model("listing",listingSchema);
module.exports= Listing;