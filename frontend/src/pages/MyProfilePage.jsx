import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { profileApi } from '@/services/profile.api'
import useAuthStore from '@/store/authStore'
import { toast } from 'sonner'
import { User, MapPin, Droplets, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, InputLabel, InputError } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const ORGANS = ['Kidney','Liver','Heart','Lungs','Pancreas','Eyes']

const profileSchema = z.object({
  phone: z.string().optional(),
  age: z.coerce.number().min(18, 'Must be 18 or older').optional(),
  weight: z.coerce.number().positive().optional(),
  bloodGroup: z.enum([...BLOOD_GROUPS, '']).optional(),
  medicalConditions: z.string().optional(),
  emergencyContact: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
})

export default function MyProfilePage() {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [isOrganDonor, setIsOrganDonor] = useState(false)
  const [selectedOrgans, setSelectedOrgans] = useState([])
  const [isAvailable, setIsAvailable] = useState(true)
  const [isPhonePublic, setIsPhonePublic] = useState(false)
  const [coords, setCoords] = useState(null)
  const [locating, setLocating] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (!user?.id) return
    profileApi.getProfile(user.id)
      .then(res => {
        const p = res.data.profile
        setProfile(p)
        setIsOrganDonor(p.isOrganDonor || false)
        setSelectedOrgans(p.organsDonating || [])
        setIsAvailable(p.isAvailableForBloodDonation ?? true)
        setIsPhonePublic(p.isPhonePublic ?? false)
        
        if (p.location?.coordinates && p.location.coordinates.length === 2) {
          setCoords({
            lng: p.location.coordinates[0],
            lat: p.location.coordinates[1]
          })
        }

        reset({
          phone: p.phone || '',
          age: p.age || '',
          weight: p.weight || '',
          bloodGroup: p.bloodGroup || '',
          medicalConditions: p.medicalConditions || '',
          emergencyContact: p.emergencyContact || '',
          state: p.state || '',
          city: p.city || '',
          pincode: p.pincode || '',
        })
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [user?.id, reset])

  const toggleOrgan = (organ) => {
    setSelectedOrgans(prev =>
      prev.includes(organ) ? prev.filter(o => o !== organ) : [...prev, organ]
    )
  }

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        isOrganDonor,
        organsDonating: isOrganDonor ? selectedOrgans : [],
        isAvailableForBloodDonation: isAvailable,
        isPhonePublic,
        ...(coords ? { location: { type: 'Point', coordinates: [coords.lng, coords.lat] } } : {})
      }
      const res = await profileApi.updateProfile(payload)
      setUser({ ...user, profileCompleted: res.data.profile.profileCompleted })
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    }
  }

  const handleDetectLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
        toast.success('Location detected! Save your profile to update it.')
      },
      () => {
        toast.error('Could not get location. Please allow location access.')
        setLocating(false)
      }
    )
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <User className="w-6 h-6 text-primary-500" />
          My Profile
        </h1>
        <p className="text-slate-500 mt-1">Keep your donor information up to date.</p>
      </div>

      {/* Read-only header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 mb-6 text-white flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold">
          {user?.fullName?.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-bold">{user?.fullName}</h2>
          <p className="text-white/80 text-sm">{user?.email}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs bg-white/20 rounded-full px-3 py-1 capitalize">{user?.role}</span>
            {user?.isVerified ? (
              <span className="text-xs rounded-full px-3 py-1 bg-green-400/20">✓ Verified Donor</span>
            ) : (profile?.isAvailableForBloodDonation || profile?.isOrganDonor) ? (
              <span className="text-xs rounded-full px-3 py-1 bg-amber-400/20">⏳ Pending Admin Verification</span>
            ) : null}
          </div>
          {(profile?.isAvailableForBloodDonation || profile?.isOrganDonor) && !user?.isVerified && (
            <p className="text-sm mt-3 bg-amber-500/20 px-3 py-2 rounded-lg border border-amber-500/30 text-amber-50 font-medium">
              Your request has been sent to our team. You'll be searchable once approved.
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4 text-slate-500" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <InputLabel htmlFor="phone">Phone Number</InputLabel>
              <Input id="phone" placeholder="+91 98765 43210" {...register('phone')} />
              <InputError message={errors.phone?.message} />
              <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPhonePublic}
                  onChange={e => setIsPhonePublic(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary-500"
                />
                <span className="text-xs text-slate-600">
                  {isPhonePublic
                    ? '📞 Phone visible to others — they can call you directly'
                    : '🔒 Phone private — others can only message you'}
                </span>
              </label>
            </div>
            <div>
              <InputLabel htmlFor="age">Age</InputLabel>
              <Input id="age" type="number" placeholder="25" {...register('age')} />
              <InputError message={errors.age?.message} />
            </div>
            <div>
              <InputLabel htmlFor="weight">Weight (kg)</InputLabel>
              <Input id="weight" type="number" placeholder="65" {...register('weight')} />
              <InputError message={errors.weight?.message} />
            </div>
            <div>
              <InputLabel htmlFor="emergencyContact">Emergency Contact</InputLabel>
              <Input id="emergencyContact" placeholder="+91 98765 43210" {...register('emergencyContact')} />
            </div>
            <div className="sm:col-span-2">
              <InputLabel htmlFor="medicalConditions">Medical Conditions</InputLabel>
              <Input id="medicalConditions" placeholder="Any relevant medical history..." {...register('medicalConditions')} />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-4 h-4 text-slate-500" /> Location
            </CardTitle>
            <CardDescription>
              We need your exact coordinates to match you with nearby requests. 
              Your exact location is kept private and only used for distance calculations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 bg-slate-50">
              <Button 
                type="button" 
                variant={coords ? "outline" : "default"} 
                onClick={handleDetectLocation} 
                disabled={locating}
                className="gap-2 shrink-0"
              >
                {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                {coords ? 'Update Coordinates' : 'Detect My Location'}
              </Button>
              <div className="text-sm text-slate-600">
                {coords 
                  ? <span className="text-green-600 font-medium flex items-center gap-1">✓ Coordinates set ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})</span> 
                  : <span className="text-amber-600 font-medium">⚠️ Coordinates missing. You will not appear in nearby searches.</span>}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <div>
                <InputLabel htmlFor="state">State</InputLabel>
                <Input id="state" placeholder="Maharashtra" {...register('state')} />
              </div>
              <div>
                <InputLabel htmlFor="city">City</InputLabel>
                <Input id="city" placeholder="Mumbai" {...register('city')} />
              </div>
              <div>
                <InputLabel htmlFor="pincode">Pincode</InputLabel>
                <Input id="pincode" placeholder="400001" {...register('pincode')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donation Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplets className="w-4 h-4 text-primary-500" /> Donation Information
            </CardTitle>
            <CardDescription>
              Toggle these settings to become a donor. 
              <strong>Note:</strong> Opting in requires admin verification before you appear in public searches.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <InputLabel>Blood Group</InputLabel>
              <div className="flex flex-wrap gap-2 mt-1">
                {BLOOD_GROUPS.map(g => (
                  <label key={g} className="cursor-pointer">
                    <input type="radio" value={g} className="peer sr-only" {...register('bloodGroup')} />
                    <div className="px-3 py-1.5 rounded-lg border-2 border-slate-200 text-sm font-semibold text-slate-600 peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700 hover:border-slate-300 transition-all">
                      {g}
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={e => setIsAvailable(e.target.checked)}
                className="w-4 h-4 accent-primary-500"
              />
              <span className="text-sm text-slate-700">Available for blood donation</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isOrganDonor}
                onChange={e => setIsOrganDonor(e.target.checked)}
                className="w-4 h-4 accent-primary-500"
              />
              <span className="text-sm text-slate-700">I am an organ donor</span>
            </label>
            {isOrganDonor && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Select organs to donate:</p>
                <div className="flex flex-wrap gap-2">
                  {ORGANS.map(o => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => toggleOrgan(o)}
                      className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedOrgans.includes(o)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full gap-2">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
    </div>
  )
}
