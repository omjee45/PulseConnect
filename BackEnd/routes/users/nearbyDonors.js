const express = require('express')
const router = express.Router()
const userModel = require('../../models/userModel')

router.get('/', async (req, res) => {
    try {
        const { city, state, bloodGroup, lat, lng, radius } = req.query

        
        if (lat && lng) {
            const latitude  = parseFloat(lat)
            const longitude = parseFloat(lng)
            const maxDistMeters = parseInt(radius) || 50000  

            if (isNaN(latitude) || isNaN(longitude)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid latitude or longitude"
                })
            }

            
            const matchFilter = {
                isVerified: true,
                role: 'donor',
                isAvailableForBloodDonation: true,
                
                'location.coordinates': { $ne: [0, 0] }
            }

            if (bloodGroup && bloodGroup.trim()) {
                matchFilter.bloodGroup = bloodGroup.trim()
            }

            const donors = await userModel.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates: [longitude, latitude]
                        },
                        distanceField: 'distance',  
                        maxDistance: maxDistMeters,
                        spherical: true,
                        query: matchFilter
                    }
                },
                {
                    $project: { password: 0 }   
                },
                {
                    $limit: 50
                }
            ])

            return res.status(200).json({
                success: true,
                count: donors.length,
                mode: 'geolocation',
                donors
            })
        }

        
        const filter = {
            isVerified: true,
            role: 'donor',
            isAvailableForBloodDonation: true
        }

        if (city && city.trim()) {
            filter.city = { $regex: new RegExp(city.trim(), 'i') }
        }

        if (state && state.trim()) {
            filter.state = { $regex: new RegExp(state.trim(), 'i') }
        }

        if (bloodGroup && bloodGroup.trim()) {
            filter.bloodGroup = bloodGroup.trim()
        }

        const donors = await userModel
            .find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(50)

        return res.status(200).json({
            success: true,
            count: donors.length,
            mode: 'text',
            donors
        })
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
})

module.exports = router
