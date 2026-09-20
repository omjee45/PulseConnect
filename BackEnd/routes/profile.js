const express = require('express')
const router = express.Router();
const jwt = require("jsonwebtoken")
const userModel = require('../models/userModel')


router.get('/', async (req, res) => {
    try {
        let decoded = jwt.verify(req.cookies.token, "ciagrette")
        let user = await userModel.findById(decoded.id).select('-password')
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }
        return res.status(200).json({ success: true, user })
    } catch (err) {
        return res.status(401).json({ success: false, message: "Unauthorized" })
    }
})


router.post('/', async(req, res) => {
    try {

        let user = jwt.verify(req.cookies.token, "ciagrette")
        await userModel.updateOne({ _id: user.id }, req.body)
        return res.status(200).json({
            success: true,
            message: "Profile Submitted For Verification"
        })
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Something Went Wrong"
        })

    }
})
module.exports = router