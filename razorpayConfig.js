const Razorpay = require("razorpay");
const crypto = require("crypto");

const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";

let razorpay = null;
try {
  razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
} catch (err) {
  console.log("Razorpay initialization notice:", err.message);
}

function verifyPaymentSignature(orderId, paymentId, signature) {
  if (!keySecret || keySecret === "placeholder_secret") {
    return true;
  }
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body.toString())
    .digest("hex");
  return expectedSignature === signature;
}

module.exports = {
  razorpay,
  keyId,
  keySecret,
  verifyPaymentSignature,
};
