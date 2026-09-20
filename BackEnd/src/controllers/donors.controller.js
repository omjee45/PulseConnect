const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// ─── GET /api/donors/nearby ───────────────────────────────────────────────
const getNearbyDonors = asyncHandler(async (req, res) => {
  const { lng, lat, distance = 50, bloodGroup, organ } = req.query;

  if (!lng || !lat) {
    throw new ApiError(400, 'Longitude and Latitude are required');
  }

  const parsedLng = parseFloat(lng);
  const parsedLat = parseFloat(lat);
  const maxDistanceMeters = parseInt(distance) * 1000; // km → meters


  console.log('[getNearbyDonors] Request params:', {
    coordinates: [parsedLng, parsedLat],
    radiusKm: parseInt(distance),
    maxDistanceMeters,
    bloodGroup: bloodGroup || 'any',
    organ: organ || 'any',
    requesterId: req.user?.id || 'public',
  });

  const filter = {
    role: { $in: ['donor', 'recipient'] },
    isVerified: true,
    // GeoJSON spatial query
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parsedLng, parsedLat],
        },
        $maxDistance: maxDistanceMeters,
      },
    },
  };

  // Exclude the requester if they are logged in
  if (req.user && req.user.id) {
    filter._id = { $ne: req.user.id };
  }

  // If specific filters are applied, use them. 
  // Otherwise, ensure the user is at least willing to donate *something*.
  if (bloodGroup && organ) {
    filter.bloodGroup = bloodGroup;
    filter.isAvailableForBloodDonation = true;
    filter.isOrganDonor = true;
    filter.organsDonating = organ;
  } else if (bloodGroup) {
    filter.bloodGroup = bloodGroup;
    filter.isAvailableForBloodDonation = true;
  } else if (organ) {
    filter.isOrganDonor = true;
    filter.organsDonating = organ;
  } else {
    filter.$or = [
      { isAvailableForBloodDonation: true },
      { isOrganDonor: true }
    ];
  }

  console.log('[getNearbyDonors] Executing filter:', JSON.stringify(filter, null, 2));

  const donors = await User.find(filter)
    .select('fullName bloodGroup city state isOrganDonor organsDonating location isVerified phone isPhonePublic')
    .limit(100);

  console.log(`[getNearbyDonors] Found ${donors.length} donors`);

  // Strip phone from results where donor chose to keep it private
  const safeDonors = donors.map(d => {
    const obj = d.toObject();
    if (!obj.isPhonePublic) delete obj.phone;
    return obj;
  });

  res.json({ success: true, count: safeDonors.length, donors: safeDonors });
});

module.exports = { getNearbyDonors };
