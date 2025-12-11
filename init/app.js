const mongoose = require("mongoose");
const intidata = require("./data.js");
const Listing = require("../models/listing.js");

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

const initDB = async ()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(intidata.data);

    console.log("data is intialize");
}

initDB();