import Listing from "../models/listing.js";
import Booking from "../models/booking.js";
import { getAmenitiesForListing } from "../utils/amenitiesHelper.js";
import { razorpay, keyId, verifyPaymentSignature } from "../config/razorpayConfig.js";

export const index = async (req, res) => {

  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing requested does not exist");
    return res.redirect("/listings");
  }

  // Ensure listing has amenities populated
  if (!listing.amenities || listing.amenities.length === 0) {
    listing.amenities = getAmenitiesForListing(listing);
    await Listing.updateOne({ _id: listing._id }, { $set: { amenities: listing.amenities } });
  }

  let { checkIn, checkOut, nights, guests } = req.query;
  let parsedNights = 1;
  let checkInVal = checkIn || "2026-09-18";
  let checkOutVal = checkOut || "2026-09-19";

  if (checkIn && checkOut) {
    let d1 = new Date(checkIn);
    let d2 = new Date(checkOut);
    if (!isNaN(d1.getTime()) && !isNaN(d2.getTime()) && d2 > d1) {
      parsedNights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
    }
  } else if (nights) {
    const n = parseInt(nights, 10);
    if (!isNaN(n) && n >= 1) {
      parsedNights = n;
      let d1 = new Date(checkInVal);
      let d2 = new Date(d1);
      d2.setDate(d2.getDate() + parsedNights);
      checkOutVal = d2.toISOString().split("T")[0];
    }
  }

  res.render("./listings/show.ejs", { 
    listing,
    checkIn: checkInVal,
    checkOut: checkOutVal,
    nights: parsedNights,
    guests: guests || 1
  });
};

export const renderNewform = (req, res) => {
  res.render("./listings/new.ejs");
};

export const Newlisting = async (req, res, next) => {
  const listingData = { ...req.body.listing };

  // Parse amenities from form submission if present
  const rawAmenities = req.body.amenities || listingData.amenities;
  if (rawAmenities) {
    const parsed = [];
    const list = Array.isArray(rawAmenities) ? rawAmenities : [rawAmenities];
    for (let item of list) {
      if (typeof item === "string" && item.includes("|")) {
        const [name, icon, availableStr] = item.split("|");
        parsed.push({
          name,
          icon: icon || "fa-solid fa-check",
          available: availableStr !== "false",
        });
      }
    }
    if (parsed.length > 0) {
      listingData.amenities = parsed;
    }
  }

  const newListing = new Listing(listingData);
  newListing.owner = req.user._id;
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    newListing.image = { url, filename };
  }
  if (!newListing.amenities || newListing.amenities.length === 0) {
    newListing.amenities = getAmenitiesForListing(newListing);
  }
  await newListing.save();
  req.flash("success", "New listing created successfully!");
  res.redirect(`/listings/${newListing._id}`);
};

export const renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing requested does not exist");
    return res.redirect("/listings");
  }
  let originalImage = listing.image && listing.image.url ? listing.image.url : "";
  if (originalImage) {
    originalImage = originalImage.replace("/upload", "/upload/w_250,h_250");
  }
  res.render("./listings/edit.ejs", { listing, originalImage });
};

export const editListing = async (req, res) => {
  let { id } = req.params;
  const updateData = { ...req.body.listing };

  const rawAmenities = req.body.amenities || updateData.amenities;
  if (rawAmenities) {
    const parsed = [];
    const list = Array.isArray(rawAmenities) ? rawAmenities : [rawAmenities];
    for (let item of list) {
      if (typeof item === "string" && item.includes("|")) {
        const [name, icon, availableStr] = item.split("|");
        parsed.push({
          name,
          icon: icon || "fa-solid fa-check",
          available: availableStr !== "false",
        });
      }
    }
    if (parsed.length > 0) {
      updateData.amenities = parsed;
    }
  }

  let listing = await Listing.findByIdAndUpdate(id, updateData, { new: true });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing updated successfully!");
  return res.redirect(`/listings/${id}`);
};

export const Deletelisting = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};

export const renderBookForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("owner");
  if (!listing) {
    req.flash("error", "Listing requested does not exist");
    return res.redirect("/listings");
  }

  // Default dates
  let defaultCheckIn = new Date("2026-09-18");
  if (req.query.checkIn && !isNaN(new Date(req.query.checkIn).getTime())) {
    defaultCheckIn = new Date(req.query.checkIn);
  }

  let defaultCheckOut = new Date(defaultCheckIn);
  let nights = parseInt(req.query.nights, 10);

  if (req.query.checkOut && !isNaN(new Date(req.query.checkOut).getTime())) {
    const customOut = new Date(req.query.checkOut);
    if (customOut > defaultCheckIn) {
      defaultCheckOut = customOut;
      nights = Math.max(1, Math.round((defaultCheckOut - defaultCheckIn) / (1000 * 60 * 60 * 24)));
    } else {
      defaultCheckOut.setDate(defaultCheckOut.getDate() + (nights >= 1 ? nights : 1));
    }
  } else {
    if (isNaN(nights) || nights < 1) nights = 1;
    defaultCheckOut.setDate(defaultCheckOut.getDate() + nights);
  }

  if (isNaN(nights) || nights < 1) {
    nights = Math.max(1, Math.round((defaultCheckOut - defaultCheckIn) / (1000 * 60 * 60 * 24)));
  }

  const guests = 1;
  const pricePerNight = listing.price || 12500;
  const basePrice = pricePerNight * nights;
  const taxes = Math.round(basePrice * 0.18);
  const total = basePrice + taxes;

  res.render("./listings/book.ejs", {
    listing,
    checkIn: defaultCheckIn.toISOString().split("T")[0],
    checkOut: defaultCheckOut.toISOString().split("T")[0],
    nights,
    guests,
    pricePerNight,
    basePrice,
    taxes,
    total,
  });
};

export const createBooking = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing requested does not exist");
    return res.redirect("/listings");
  }

  let { checkIn, checkOut, nights, guests, adults } = req.body.booking || {};
  let numAdults = parseInt(adults, 10);
  if (!isNaN(numAdults) && numAdults > 2) {
    req.flash("error", "Only up to 2 adults can stay in one room.");
    return res.redirect(`/listings/${id}/book`);
  }

  let checkInDate = new Date(checkIn || "2026-09-18");
  let checkOutDate = new Date(checkOut || "2026-09-19");

  let numNights = parseInt(nights, 10);
  if (isNaN(numNights) || numNights < 1) {
    numNights = Math.max(1, Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
  }

  let numGuests = parseInt(guests, 10) || 1;
  let pricePerNight = listing.price || 0;
  let basePrice = pricePerNight * numNights;
  let taxes = Math.round(basePrice * 0.18);
  let totalPrice = basePrice + taxes;

  const newBooking = new Booking({
    listing: listing._id,
    user: req.user._id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    nights: numNights,
    guests: numGuests,
    pricePerNight,
    basePrice,
    taxes,
    totalPrice,
    status: "confirmed",
  });

  await newBooking.save();

  req.flash(
    "success",
    `Reservation confirmed for "${listing.title}" (${numNights} night${numNights > 1 ? 's' : ''}, Total: ₹${totalPrice.toLocaleString("en-IN")})! Enjoy your stay.`
  );
  res.redirect(`/bookings`);
};

export const createPaymentOrder = async (req, res) => {

  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).json({ success: false, message: "Listing not found" });
  }

  let { checkIn, checkOut, nights, guests, adults } = req.body || {};
  let numAdults = parseInt(adults, 10);
  if (!isNaN(numAdults) && numAdults > 2) {
    return res.status(400).json({ success: false, message: "Only up to 2 adults can stay in one room." });
  }

  let checkInDate = new Date(checkIn || "2026-09-18");
  let checkOutDate = new Date(checkOut || "2026-09-19");

  let numNights = parseInt(nights, 10);
  if (isNaN(numNights) || numNights < 1) {
    numNights = Math.max(1, Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
  }

  let pricePerNight = listing.price || 0;
  let basePrice = pricePerNight * numNights;
  let taxes = Math.round(basePrice * 0.18);
  let totalPrice = basePrice + taxes;
  let amountInPaise = totalPrice * 100;

  let orderId = `order_${Date.now()}`;
  let isRealOrder = false;

  if (razorpay && keyId && keyId.startsWith("rzp_") && keyId !== "rzp_test_placeholder") {
    try {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${Date.now().toString().slice(-8)}`,
      });
      orderId = order.id;
      isRealOrder = true;
    } catch (err) {
      console.log("Razorpay live order notice:", err.message);
      orderId = `order_sim_${Date.now()}`;
    }
  }

  res.json({
    success: true,
    orderId,
    amount: amountInPaise,
    currency: "INR",
    keyId: keyId || "rzp_test_placeholder",
    isRealOrder,
    listingTitle: listing.title,
    listingImage: listing.image && listing.image.url ? listing.image.url : "",
    totalPrice,
    user: {
      name: req.user ? req.user.username : "Guest",
      email: req.user ? req.user.email : "",
    },
  });
};

export const verifyPayment = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).json({ success: false, message: "Listing not found" });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    booking,
  } = req.body || {};

  const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) {
    return res.status(400).json({ success: false, message: "Payment verification failed: Invalid signature." });
  }

  let { checkIn, checkOut, nights, guests } = booking || {};
  let checkInDate = new Date(checkIn || "2026-09-18");
  let checkOutDate = new Date(checkOut || "2026-09-19");
  let numNights = parseInt(nights, 10) || 1;
  let numGuests = parseInt(guests, 10) || 1;

  let pricePerNight = listing.price || 0;
  let basePrice = pricePerNight * numNights;
  let taxes = Math.round(basePrice * 0.18);
  let totalPrice = basePrice + taxes;

  const newBooking = new Booking({
    listing: listing._id,
    user: req.user._id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    nights: numNights,
    guests: numGuests,
    pricePerNight,
    basePrice,
    taxes,
    totalPrice,
    status: "confirmed",
    razorpayPaymentId: razorpay_payment_id || `pay_sim_${Date.now()}`,
    razorpayOrderId: razorpay_order_id,
    paymentStatus: "paid",
  });

  await newBooking.save();

  req.flash(
    "success",
    `Payment received via Razorpay! Reservation confirmed for "${listing.title}" (${numNights} night${numNights > 1 ? 's' : ''}, Total: ₹${totalPrice.toLocaleString("en-IN")}).`
  );

  res.json({
    success: true,
    message: "Payment verified successfully",
    redirectUrl: `/bookings`,
  });
};