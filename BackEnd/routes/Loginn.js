const express = require("express")
const router = express.Router()
const jwt = require('jsonwebtoken')
const usermodel = require('../models/userModel')
const adminmodel = require('../models/AdminModel')
const bcrypt = require('bcrypt')
router.post('/', async(req, res) => {
    try {
        let { password, email } = req.body
        console.log(req.body);

        if (email === 'pulseadmin@gmail.com') {
            let admin = await adminmodel.findOne({ email: email })
            if (admin) {
                const token = jwt.sign({ id: admin._id, role: admin.role },
                    "ciagrette", { expiresIn: "7d" }
                );
                res.cookie("token", token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax",
                    maxAge: 7 * 24 * 60 * 60 * 1000
                });
                return res.status(200).json({
                    success: true,
                    admin: true
                })
            }
        }
        const user = await usermodel.findOne({ email: email })
        console.log(user);

        if (!user)
            return res.status(400).json({
                success: false,
                message: "User not found"
            });

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch)
            return res.status(400).json({
                success: false,
                message: "User not found"
            });

        const token = jwt.sign({ id: user._id, role: user.role },
            "ciagrette", { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            success: true,
            message: "Login successful"
        });
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Something Went Wrong"
        })
    }




})
module.exports = router