const express = require('express')
const router = express.Router()
const controller = require('../controller/controller')


router.get('/seats',controller.get)
// router.put('/update',controller.update)
router.get('/seats/:id',controller.getSeatPricing)
router.post('/booking',controller.createBooking)
router.get('/bookings',controller.bookings)




//WRONG PATH
router.all('/*', (req, res) => {
    res.status(400).send({
        status: false,
        message: 'Path not found'
    })
})

module.exports = router