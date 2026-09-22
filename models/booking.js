import mongoose from "mongoose";
const schema = mongoose.Schema;


const bookingSchema = new schema({
  listing: {
    type: schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  user: {
    type: schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  nights: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  guests: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  pricePerNight: {
    type: Number,
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
  },
  taxes: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["confirmed", "cancelled"],
    default: "confirmed",
  },
  razorpayPaymentId: {
    type: String,
  },
  razorpayOrderId: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ["paid", "pending", "failed"],
    default: "paid",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;

