const express = require('express')
const mongoose = require('mongoose')
const route = require('./route/route')
const app = express()

app.use(express.json())


mongoose.set('strictQuery', true)

mongoose.connect('mongodb+srv://rjrohit13:DK5kJCqUIXc68mFC@cluster0.0zq8uvw.mongodb.net/backend', { useNewUrlParser: true })
    .then(() => { console.log('MongoDB is connected') })
    .catch((error) => { console.log(error) })

app.use('/', route) 

app.listen(3000, function () {
    console.log('Express app running on port ' + 3000)
})