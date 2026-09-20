const express = require('express')
const cookiepareser = require("cookie-parser")
const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
    try {
        let token = req.cookies.token
        if (!token) {
            return res.status(400).json({
                message: "Unauthorized"
            })
        }
        const user = jwt.verify(token, "ciagrette")
        req.user = user
        next()
    } catch (err) {
        console.log(err);

    }
}
module.exports = authMiddleware