const mongoose = require("mongoose")
const bookingSchema = new mongoose.Schema({
    seatIds:{
        type:[String],
        required:true
    },
    name: {
        type: String,
        required:true
    },

        phone_number: {
            type:Number,
            required:true
        }
      

})


module.exports = mongoose.model("booking", bookingSchema)