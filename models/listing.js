const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default: "https://unsplash.com/photos/gray-wooden-house-178j8tJrNlc",
    },
  },
  price: {
    type: Number,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  propertyType: {
    type: String,
    default: "Entire home",
  },
  guests: {
    type: Number,
    default: 2,
    min: 1,
  },
  bedrooms: {
    type: Number,
    default: 1,
    min: 1,
  },
  beds: {
    type: Number,
    default: 1,
    min: 1,
  },
  bathrooms: {
    type: Number,
    default: 1,
    min: 1,
  },
  reviews: [
    {
      type: schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: schema.Types.ObjectId,
    ref: "User",
  },
  amenities: [
    {
      name: {
        type: String,
        required: true,
      },
      icon: {
        type: String,
        default: "fa-solid fa-check",
      },
      available: {
        type: Boolean,
        default: true,
      },
    },
  ],
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing && listing.reviews && listing.reviews.length) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
