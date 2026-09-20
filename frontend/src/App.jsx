import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import useAuthStore from '@/store/authStore'
import { authApi } from '@/services/auth.api'

// Pages
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import HomePage from '@/pages/HomePage'
import DashboardPage from '@/pages/DashboardPage'
import NearbyDonorsPage from '@/pages/NearbyDonorsPage'
import ChatPage from '@/pages/ChatPage'
import MyProfilePage from '@/pages/MyProfilePage'
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  const { setUser, clearUser, setLoading } = useAuthStore()

  // On mount: verify session is still valid via GET /api/auth/me
  // This is what keeps the user logged in across page refreshes.
  useEffect(() => {
    setLoading(true)
    authApi.getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => clearUser())
  }, [])

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-slate-50">
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Navigate to="/home" replace />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/home"     element={<HomePage />} />
          <Route path="/find-donors" element={<NearbyDonorsPage />} />

          {/* Protected — any authenticated user */}
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute><ChatPage /></ProtectedRoute>
          } />
          <Route path="/my-profile" element={
            <ProtectedRoute><MyProfilePage /></ProtectedRoute>
          } />

          {/* Protected — admin only */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        richColors
        toastOptions={{ duration: 3500 }}
      />
    </>
  )
}
