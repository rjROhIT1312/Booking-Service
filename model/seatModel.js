const mongoose = require("mongoose")
const seatSchema = new mongoose.Schema({
            
            id: {
        type: String
    }, 
    seat_identifier: {
        type: String
    }, 
    seat_class: {
        type: String
    },
    is_booked: {
        type : Boolean 
    }
    
    



})


module.exports = mongoose.model("seat", seatSchema)