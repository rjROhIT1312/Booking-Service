const seatModel = require('../model/seatModel')
const seatPricing = require('../model/seatPricing')
const user = require('../model/user')

const isValidMobile = function (mobile) {
  if (/^[0]?[6789]\d{9}$/.test(mobile)) {
    return true
  }
}
const isValidName = function (name) {
  if (/^[a-zA-Z ]+$/.test(name)) {
    return true;
  }
};


const get = async(req,res)=>{
  try {
    const getSeats = await seatModel.find().sort({ seat_class: 1 });
    return res.status(200).send({status: true, data: getSeats })
}
   catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
}

// const update = async (req, res) => {
//     try {
//       const updateField = await seatModel.updateMany({},{$set:{is_booked:false}},{new:true})
//       return res.status(200).send({ status: true, data: updateField });
//     } catch (error) {
      
//       return res.status(500).send({ status: false, error: error.message });
//     }
//   };


  const getSeatPricing = async (req, res) => {
    try {
        const {id}  = req.params;
  
      // Retrieve seat details from the database using the provided ID
      const seat = await seatModel.findOne({id});

      if (!seat) {
        return res.status(404).send({ status: false, message: 'Seat not found' });
      }

      const bookedStatus = seat.is_booked

      const seatClass = seat.seat_class;

      // Fetch booking data for the given seat class
      const bookings = await seatModel.find({ seat_class: seatClass });
  
      // Calculate the total number of seats
      const totalSeats = bookings.length;
  
      // Calculate the number of booked seats
      const bookedSeats = bookings.filter(seat => seat.is_booked === true);
      const numberOfBookedSeats = bookedSeats.length;

  
      // Calculate the percentage of seats booked
      const seatsBookedPercentage = (numberOfBookedSeats / totalSeats) * 100;

      const seatPrice = await seatPricing.findOne({seat_class:seatClass})
  
      let pricing;
  
      if (seatsBookedPercentage < 40) {
        // Less than 40% seats booked
        pricing = seatPrice.min_price || seatPrice.normal_price;
        // console.log(pricing)
      } else if (seatsBookedPercentage >= 40 && seatsBookedPercentage <= 60) {
        // 40% - 60% seats booked
        pricing = seatPrice.normal_price || seatPrice.max_price;
      } else {
        // More than 60% seats booked
        pricing = seatPrice.max_price || seatPrice.normal_price;
      }
  
    
      const response = {
        id: seat.id,
        seat_identifier: seat.seat_identifier,
        seat_class: seatClass,
        is_booked:bookedStatus,
        pricing: pricing
      };
  

      return res.status(200).send({ status: true, data: response });
    } catch (error) {
      console.error('Error fetching seat pricing:', error);
      return res.status(500).send({ status: false, message: error.message });
    }
  };


const createBooking = async (req, res) => {
  try {
    const { seatIds, name, phone_number } = req.body;
    if(!seatIds){
      return res.status(400).send({status:false, message:"Please provide seatId"})
    }
    const seats = await seatModel.find({ id: { $in: seatIds } });
    if(seats<1){
      return res.status(400).send({status:false, message:"Please give seatIds between 1 to 500"})
    }
    if(!name){
      return res.status(400).send({status:false, message:"Please provide name"})
    }
    if (!isValidName(name)){
    return res.status(400).send({ status: false, message: "Please enter name in a string" })
    }
    if(!phone_number){
      return res.status(400).send({status:false, message:"Please provide phone_number"})
    }
    if (!isValidMobile(phone_number)){
      return res.status(400).send({ status: false, message: "Please enter the valid Mobile Number" })
    }
    

    for (const seat of seats) {
      if (seat.is_booked) {
        return res.status(400).send({ status: false, message: 'Some seats are already booked' });
      }
    }

    const seatClasses = seats.map(seat => seat.seat_class);

    const seatPrices = await seatPricing.find({ seat_class: { $in: seatClasses } });

    const bookings = await seatModel.find({ seat_class: { $in: seatClasses } });
    const totalSeats = bookings.length;
    const bookedSeats = bookings.filter(seat => seat.is_booked);
    const numberOfBookedSeats = bookedSeats.length;
    const seatsBookedPercentage = (numberOfBookedSeats / totalSeats) * 100;

let totalPrice = 0;

    for (const seatId of seatIds) {
      const seat = seats.find(seat => seat.id === seatId);
      const seatClass = seat.seat_class;
      const seatPrice = seatPrices.find(price => price.seat_class === seatClass);

      let pricing;

      if (seatsBookedPercentage < 40) {
        pricing = seatPrice.min_price || seatPrice.normal_price;
      } else if (seatsBookedPercentage >= 40 && seatsBookedPercentage <= 60) {
        pricing = seatPrice.normal_price || seatPrice.max_price;
      } else {
        pricing = seatPrice.max_price || seatPrice.normal_price;
      }

      totalPrice += parseFloat(pricing.replace('$', ''));
    }

    
    await seatModel.updateMany({ id: { $in: seatIds } }, { is_booked: true });

   
    const response = {
      seatIds,
      name,
      phone_number,
      totalPrice: '$' + totalPrice.toFixed(2)
    };

    const booking = await user.create(response);

    return res.status(200).send({ status: true, message:"Booking Completed", bookingId: booking.id, totalPrice: response.totalPrice });

  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).send({ status: false, message: error.message });
  }
};


const bookings = async (req,res)=>{
  try {
    const {userIdentifier} = req.query

   
    if(!userIdentifier){
      return res.status(400).send({status: false, mesaage:"Please provie Phone Number to find the bokkings"})
    }

    if (!isValidMobile(userIdentifier)){
      return res.status(400).send({ status: false, message: "Please enter the valid Mobile Number" })
    }

    
    const allBookings = await user.find({ phone_number: { $in: userIdentifier } });

   
    if(allBookings.length < 1){
      return res.status(400).send({status: false, message: "No Booking found with this Phone Number "})
    }
    
    return res.status(200).send({ status: true, allBookings:allBookings})

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
}



module.exports = { get, update, getSeatPricing, createBooking, bookings }
