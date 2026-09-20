const express = require('express')
const router = express.Router()
const userModel = require('../../models/userModel')
router.get('/', async(req, res) => {
    try {
        let users = await userModel.find({ isVerified: true })
        if (!users) {
            return res.status(400).json({
                success: true,
                message: "No Verified Users"
            })
        }
        return res.status(200).json({
            success: true,
            users
        })
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: err.message
        })


    }

})
module.exports = router