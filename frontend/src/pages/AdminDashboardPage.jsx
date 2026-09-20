import { useState, useEffect } from 'react'
import { adminApi } from '@/services/admin.api'
import { toast } from 'sonner'
import { ShieldCheck, UserCheck, Users, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(null)
  const [rejecting, setRejecting] = useState(null)

  const loadUsers = async () => {
    try {
      const res = await adminApi.getUnverifiedUsers()
      setUsers(res.data.users)
    } catch {
      toast.error('Failed to load unverified users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  const handleVerify = async (userId) => {
    setVerifying(userId)
    try {
      await adminApi.verifyUser(userId)
      toast.success('User verified successfully')
      setUsers(prev => prev.filter(u => u._id !== userId))
    } catch {
      toast.error('Verification failed')
    } finally {
      setVerifying(null)
    }
  }

  const handleReject = async (userId) => {
    setRejecting(userId)
    try {
      await adminApi.rejectUser(userId)
      toast.success('User rejected and account deleted')
      setUsers(prev => prev.filter(u => u._id !== userId))
    } catch {
      toast.error('Rejection failed')
    } finally {
      setRejecting(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-primary-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">Review and verify new user registrations</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Users, label: 'Pending Verification', value: loading ? '—' : users.length, color: 'bg-amber-50 text-amber-600' },
          { icon: UserCheck, label: 'Total Verified', value: '—', color: 'bg-green-50 text-green-600' },
          { icon: ShieldCheck, label: 'Platform Status', value: 'Healthy', color: 'bg-blue-50 text-blue-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Users to verify */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Unverified Users
            {!loading && users.length > 0 && (
              <Badge variant="warning">{users.length} pending</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <CheckCircle className="w-14 h-14 mx-auto mb-3 opacity-30 text-green-400" />
              <p className="font-medium">All users are verified</p>
              <p className="text-sm mt-1">No pending registrations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map(u => (
                <div key={u._id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-primary-200 transition-colors">
                  <div className="w-11 h-11 rounded-full bg-slate-100 hidden sm:flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-slate-600">{u.fullName.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 text-sm">{u.fullName}</span>
                      <Badge variant="secondary" className="capitalize">{u.role}</Badge>
                      {u.bloodGroup && <Badge variant="default">{u.bloodGroup}</Badge>}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{u.email}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Joined: {new Date(u.createdAt).toLocaleDateString()}</div>
                    {u.city && <div className="text-xs text-slate-400">{u.city}, {u.state}</div>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(u._id)}
                      disabled={verifying === u._id || rejecting === u._id}
                      className="gap-1.5 text-danger hover:text-danger hover:bg-red-50 border-danger/20"
                    >
                      {rejecting === u._id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <XCircle className="w-3.5 h-3.5" />}
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleVerify(u._id)}
                      disabled={verifying === u._id || rejecting === u._id}
                      className="gap-1.5"
                    >
                      {verifying === u._id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <UserCheck className="w-3.5 h-3.5" />}
                      Verify
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

