const mongoose = require("mongoose")
mongoose.connect("mongodb://localhost:27017/pulseConnect")
    .then(() => {
        console.log("DB Connected Succesfully")
    })
    .catch(() => {
        console.log("DB Failed to Connect")
    })