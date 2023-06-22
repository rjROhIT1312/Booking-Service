const mongoose = require("mongoose")
const seatPricingSchema = new mongoose.Schema({
    id: {
        type: String
    },

        seat_class: {
            type:String
        },
        min_price: {
            type:String
        },
        normal_price: {
            type:String
        },
        max_price: {
            type:String
        }
      

})


module.exports = mongoose.model("seatPricing", seatPricingSchema)