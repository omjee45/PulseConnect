import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import { Heart } from 'lucide-react'


export default function ProtectedRoute({ children, role }) {
  const { user, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center animate-pulse">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <p className="text-sm text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
