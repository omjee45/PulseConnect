const express = require('express')
const router = express.Router()
const jwt = require("jsonwebtoken")
const bcrpyt = require("bcrypt")


const usermodel = require('../models/userModel.js')

router.post('/', async(req, res) => {

    try {
        console.log(req.body);
        let { name, date, email, password } = req.body
        const salt = await bcrpyt.genSalt(10)
        const hashpassword = await bcrpyt.hash(password, salt)


        const user = await usermodel.create({
            fullName: name,
            DOB: new Date(date),
            email: email,
            password: hashpassword
        })
        const token = jwt.sign({ id: user._id }, "ciagrette", { expiresIn: '5h' })
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 5 * 60 * 60 * 1000
        })
        res.status(201).send({
            success: true,
            message: "User Successfully Created",
            id: user._id
        })
    } catch (err) {
        console.log(err);

        res.status(400).send({
            success: false,
            message: "Something Went Wrong"
        })
    }

})

module.exports = router