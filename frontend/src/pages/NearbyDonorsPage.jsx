import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { donorsApi } from '@/services/donors.api'
import { connectionsApi } from '@/services/connections.api'
import useAuthStore from '@/store/authStore'
import { toast } from 'sonner'
import { MapPin, Search, Loader2, Heart, Phone, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const ORGANS = ['Kidney','Liver','Heart','Lungs','Pancreas','Eyes']

// Message button — sends a connection request then goes to /chat
function MessageButton({ donorId }) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleMessage = async () => {
    if (!user) {
      toast.info('Please log in to send a message')
      navigate('/login')
      return
    }
    setLoading(true)
    try {
      await connectionsApi.sendRequest(donorId, 'Hi, I found you on PulseConnect and would like to connect.')
      toast.success('Connection request sent!')
      navigate('/chat')
    } catch (err) {
      const msg = err.response?.data?.message || ''
      // Already connected or request pending — just go to chat
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exist')) {
        navigate('/chat')
      } else {
        toast.error('Could not send message. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button size="sm" className="flex-1 gap-1.5" onClick={handleMessage} disabled={loading}>
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
      Message
    </Button>
  )
}

function DonorCard({ donor }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-primary-200 hover:shadow-md transition-all group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 transition-colors">
          <span className="text-primary-600 font-bold text-lg group-hover:text-white transition-colors">
            {donor.fullName.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{donor.fullName}</h3>
          {(donor.city || donor.state) && (
            <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
              <MapPin className="w-3 h-3" />
              {[donor.city, donor.state].filter(Boolean).join(', ')}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {donor.bloodGroup && (
              <Badge variant="default">{donor.bloodGroup}</Badge>
            )}
            {donor.isOrganDonor && donor.organsDonating?.map(organ => (
              <Badge key={organ} variant="secondary">{organ}</Badge>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
        {donor.phone ? (
          <a href={`tel:${donor.phone}`} className="flex-1">
            <Button size="sm" variant="outline" className="w-full gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              Call
            </Button>
          </a>
        ) : (
          <Button size="sm" variant="outline" className="flex-1 gap-1.5" disabled>
            <Phone className="w-3.5 h-3.5" />
            No Phone
          </Button>
        )}
        <MessageButton donorId={donor._id} />
      </div>
    </div>
  )
}

export default function NearbyDonorsPage() {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [coords, setCoords] = useState(null)
  const [bloodGroup, setBloodGroup] = useState('')
  const [organ, setOrgan] = useState('')
  const [distance, setDistance] = useState('50')

  const getLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
        toast.success('Location detected!')
      },
      () => {
        toast.error('Could not get location. Please allow location access.')
        setLocating(false)
      }
    )
  }

  const search = async () => {
    if (!coords) { toast.error('Please detect your location first.'); return }
    setLoading(true)
    try {
      const res = await donorsApi.getNearby({ ...coords, distance, bloodGroup, organ })
      setDonors(res.data.donors)
      if (res.data.donors.length === 0) toast.info('No donors found matching your criteria')
    } catch {
      toast.error('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary-500" />
          Find Nearby Donors
        </h1>
        <p className="text-slate-500 mt-1">Discover verified blood and organ donors near you.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8 space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={e => setBloodGroup(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Any blood group</option>
              {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Organ Donation</label>
            <select
              value={organ}
              onChange={e => setOrgan(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Any organ</option>
              {ORGANS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Radius (km)</label>
            <input
              type="number"
              value={distance}
              onChange={e => setDistance(e.target.value)}
              min="1" max="500"
              className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={getLocation} disabled={locating} className="gap-2">
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            {coords ? '✓ Location Detected' : 'Detect My Location'}
          </Button>
          <Button onClick={search} disabled={loading || !coords} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search Donors
          </Button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : donors.length > 0 ? (
        <>
          <p className="text-sm text-slate-500 mb-4">{donors.length} donors found</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {donors.map(d => <DonorCard key={d._id} donor={d} />)}
          </div>
        </>
      ) : donors.length === 0 && coords ? (
        <div className="text-center py-20 text-slate-400">
          <Heart className="w-14 h-14 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No donors found</p>
          <p className="text-sm mt-1">Try increasing the radius or removing filters</p>
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400">
          <MapPin className="w-14 h-14 mx-auto mb-3 opacity-20" />
          <p className="font-medium">Detect your location to find donors</p>
          <p className="text-sm mt-1">Click "Detect My Location" above to get started</p>
        </div>
      )}
    </div>
  )
}