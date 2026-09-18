const { string, required } = require("joi");
const mongoose= require("mongoose");
const schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new schema({
  email: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  dob: {
    type: Date,
  },
  promotionsOptOut: {
    type: Boolean,
    default: false,
  },
  wishlist: [
    {
      type: schema.Types.ObjectId,
      ref: "Listing",
    },
  ],
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);