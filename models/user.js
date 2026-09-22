import mongoose from "mongoose";
import passportLocalMongoosePkg from "passport-local-mongoose";

const passportLocalMongoose = passportLocalMongoosePkg.default || passportLocalMongoosePkg;
const schema = mongoose.Schema;

const userSchema = new schema({
  email: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  avatar: {
    type: String,
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
const User = mongoose.model("User", userSchema);
export default User;