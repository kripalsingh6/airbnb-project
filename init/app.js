import mongoose from "mongoose";
import intidata from "./data.js";
import Listing from "../models/listing.js";
import User from "../models/user.js";
import { getAmenitiesForListing } from "../utils/amenitiesHelper.js";

main()
.then(()=>{
console.log("mongodb connected");
})
.catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/Project");
};


const hostProfiles = [
  { username: "Sophia Anderson", email: "sophia@example.com" },
  { username: "Liam Martinez", email: "liam@example.com" },
  { username: "Elena Rossi", email: "elena@example.com" },
  { username: "Alexander Wright", email: "alex@example.com" },
  { username: "Aria Sharma", email: "aria@example.com" },
  { username: "Marcus Vance", email: "marcus@example.com" },
  { username: "Emma Watson", email: "emma@example.com" },
  { username: "Lucas Silva", email: "lucas@example.com" },
  { username: "Chloe Bennett", email: "chloe@example.com" },
  { username: "David Miller", email: "david@example.com" },
  { username: "Zoe Kravitz", email: "zoe@example.com" },
  { username: "Oliver Martinez", email: "oliver@example.com" },
  { username: "Mia Tanaka", email: "mia@example.com" },
  { username: "Noah Campbell", email: "noah@example.com" },
  { username: "Amara Patel", email: "amara@example.com" },
  { username: "Julian Becker", email: "julian@example.com" },
  { username: "Isabella Cruz", email: "isabella@example.com" },
  { username: "Ethan Brooks", email: "ethan@example.com" }
];

const initDB = async () => {
  await Listing.deleteMany({});

  // Ensure host users exist in DB
  const hosts = [];
  for (let profile of hostProfiles) {
    let user = await User.findOne({ username: profile.username });
    if (!user) {
      user = await User.register(new User({ username: profile.username, email: profile.email }), "password123");
    }
    hosts.push(user);
  }

  // Also include any other existing users
  const allUsers = await User.find({});
  const hostPool = allUsers.length > 0 ? allUsers : hosts;

  // Assign different host and unique amenities to each listing
  const initializedListings = intidata.data.map((obj, idx) => ({
    ...obj,
    owner: hostPool[idx % hostPool.length]._id,
    amenities: getAmenitiesForListing(obj),
  }));

  await Listing.insertMany(initializedListings);
  console.log("data is initialized with distinct hosts for each listing");
};

initDB();