const express = require("express")
const router = express.Router();
const jwt = require('jsonwebtoken')
router.get('/', (req, res) => {
    let token = req.cookies.token
    if (!token)
        return res.status(401).json({ success: false })
    try {
        let user = jwt.verify(token, "ciagrette")
        return res.json({
            success: true,
            user
        })
    } catch (Err) {
        console.log(Err);
    }
})
module.exports = router