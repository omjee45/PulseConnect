const express = require('express')
const router = express.Router();
const userModel = require('../../models/userModel')
router.get('/', async(req, res) => {
    try {
        let users = await userModel.find({ isVerified: false })
        console.log(users);

        if (!users) {
            return res.status(200).json({
                success: true,
                message: "No User to verify"
            })

        }
        return res.status(200).json({
            success: true,
            users
        })
    } catch (Err) {
        return res.status(400).json({
            success: false,
            message: Err.message
        })
    }
})
module.exports = router