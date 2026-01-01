const { string, date } = require("joi");
const mongoose= require("mongoose");
const schema = mongoose.Schema;

const reviewSchema= new schema({
    comment:String,
    rating:{
        type:String,
        min:1,
        max:5,
    },
    created_at:{
        type:Date,
        default: Date.now(),
    },
});
module.exports= mongoose.model("Review", reviewSchema);