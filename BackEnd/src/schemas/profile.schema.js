const { z } = require('zod');

// Shared validation logic
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const organs = ['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Eyes'];

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100).optional(),
  phone: z.string().optional(),
  age: z.number().min(18, 'Must be at least 18 years old').optional(),
  weight: z.number().positive().optional(),
  medicalConditions: z.string().optional(),
  emergencyContact: z.string().optional(),

  bloodGroup: z.enum(bloodGroups).optional(),
  isAvailableForBloodDonation: z.boolean().optional(),
  lastDonationDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: 'Invalid date' }),

  isOrganDonor: z.boolean().optional(),
  organsDonating: z.array(z.enum(organs)).optional(),

  state: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),

  // Location must be [longitude, latitude]
  location: z.object({
    coordinates: z.tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90)    // latitude
    ])
  }).optional()
});

module.exports = { updateProfileSchema };
