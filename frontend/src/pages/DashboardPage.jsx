import { useState, useEffect, useCallback } from 'react'
import { connectionsApi } from '@/services/connections.api'
import { conversationsApi } from '@/services/conversations.api'
import useAuthStore from '@/store/authStore'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { MapPin, MessageSquare, UserCheck, Clock, Bell, Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const bloodGroupColors = {
  'A+':'bg-red-100 text-red-700','A-':'bg-orange-100 text-orange-700',
  'B+':'bg-blue-100 text-blue-700','B-':'bg-indigo-100 text-indigo-700',
  'AB+':'bg-purple-100 text-purple-700','AB-':'bg-pink-100 text-pink-700',
  'O+':'bg-green-100 text-green-700','O-':'bg-teal-100 text-teal-700',
}

function RequestCard({ request, onAccept, onReject }) {
  const [loading, setLoading] = useState(false)
  const handle = async (action) => {
    setLoading(true)
    try { await action() } finally { setLoading(false) }
  }
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-primary-200 transition-colors">
      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-primary-600">{request.sender.fullName.charAt(0)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-900 text-sm">{request.sender.fullName}</span>
          {request.sender.bloodGroup && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bloodGroupColors[request.sender.bloodGroup] || 'bg-slate-100 text-slate-600'}`}>
              {request.sender.bloodGroup}
            </span>
          )}
        </div>
        {request.sender.city && <p className="text-xs text-slate-500 mt-0.5">{request.sender.city}</p>}
        {request.introMessage && (
          <p className="text-sm text-slate-600 mt-1.5 italic bg-slate-50 rounded-lg px-3 py-2">"{request.introMessage}"</p>
        )}
        <div className="flex gap-2 mt-3">
          <Button size="sm" disabled={loading} onClick={() => handle(onAccept)}>Accept</Button>
          <Button size="sm" variant="outline" disabled={loading} onClick={() => handle(onReject)}>Decline</Button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [incoming, setIncoming] = useState([])
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [reqRes, convRes] = await Promise.all([
        connectionsApi.getIncoming(),
        conversationsApi.getAll(),
      ])
      setIncoming(reqRes.data.requests)
      setConversations(convRes.data.conversations)
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleAccept = async (requestId) => {
    try {
      await connectionsApi.acceptRequest(requestId)
      toast.success('Connection accepted!')
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept')
    }
  }

  const handleReject = async (requestId) => {
    try {
      await connectionsApi.rejectRequest(requestId)
      toast.success('Request declined')
      loadData()
    } catch {
      toast.error('Failed to decline')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your connections.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Bell, label: 'Pending Requests', value: loading ? '—' : incoming.length, color: 'bg-amber-50 text-amber-600' },
          { icon: MessageSquare, label: 'Active Chats', value: loading ? '—' : conversations.length, color: 'bg-blue-50 text-blue-600' },
          { icon: Heart, label: 'Role', value: user?.role || '—', color: 'bg-primary-50 text-primary-600' },
          { icon: UserCheck, label: 'Status', value: user?.isVerified ? 'Verified' : 'Pending', color: user?.isVerified ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold text-slate-900 capitalize">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Incoming Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-500" />
                Connection Requests
                {incoming.length > 0 && (
                  <Badge variant="default">{incoming.length}</Badge>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2].map(i => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
            ) : incoming.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No pending requests</p>
                <Link to="/nearby-donors" className="text-xs text-primary-500 hover:underline mt-1 inline-block">
                  Find donors →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {incoming.map(r => (
                  <RequestCard
                    key={r._id}
                    request={r}
                    onAccept={() => handleAccept(r._id)}
                    onReject={() => handleReject(r._id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Recent Chats
              </CardTitle>
              <Link to="/chat">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Accept a connection request to start chatting</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.slice(0, 5).map(conv => {
                  const other = conv.participants.find(p => p._id !== user?.id)
                  return (
                    <Link key={conv._id} to="/chat" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600">{other?.fullName?.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 text-sm truncate">{other?.fullName}</div>
                        <div className="text-xs text-slate-500 truncate">{conv.lastMessage || 'Start chatting...'}</div>
                      </div>
                      <Clock className="w-3 h-3 text-slate-300 group-hover:text-slate-400 flex-shrink-0" />
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <Link to="/nearby-donors">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-5 text-white cursor-pointer hover:shadow-lg transition-shadow group">
            <MapPin className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">Find Nearby Donors</h3>
            <p className="text-white/70 text-sm mt-1">Discover verified donors in your area</p>
          </div>
        </Link>
        <Link to="/my-profile">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl p-5 text-white cursor-pointer hover:shadow-lg transition-shadow group">
            <UserCheck className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold">Complete Your Profile</h3>
            <p className="text-white/70 text-sm mt-1">Add blood group, location, and donor info</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
