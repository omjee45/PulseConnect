const express = require('express')
const router = express.Router();
const userModel = require('../../models/userModel')
router.put('/:id', async(req, res) => {
    try {
        await userModel.findByIdAndUpdate(req.params.id, {
            isVerified: true
        })
        return res.status(200).json({
            success: true,
            message: "User Verified Successfully"
        })
    } catch (err) {
        console.log(err.message);
        return res.status(400).json({
            success: false,
            message: err.message
        })

    }

})
module.exports = router