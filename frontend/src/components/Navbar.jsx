import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Heart, Menu, X, MessageSquare, MapPin, LayoutDashboard, User, LogOut, ShieldCheck } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { authApi } from '@/services/auth.api'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/home',          label: 'Home',         icon: null },
  { to: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/chat',          label: 'Messages',     icon: MessageSquare },
  { to: '/my-profile',    label: 'My Profile',   icon: User },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, clearUser } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (_) {
      // ignore — still clear state
    }
    clearUser()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const isActive = (to) => location.pathname === to

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/home' : '/'} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-sm group-hover:bg-primary-600 transition-colors">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">
              Pulse<span className="text-primary-500">Connect</span>
            </span>
          </Link>

          {/* Desktop nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive(to)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {label}
                </Link>
              ))}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive('/admin')
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>
          )}

          {/* Public Find Donors Link */}
          <div className="hidden md:flex items-center">
            <Link
              to="/find-donors"
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                isActive('/find-donors')
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <MapPin className="w-4 h-4" />
              Find Donors
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary-600">
                      {user.fullName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    {user.fullName}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden md:flex text-slate-600 hover:text-danger gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
                {/* Mobile menu toggle */}
                <button
                  className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                  onClick={() => setMobileOpen((v) => !v)}
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          <Link
            to="/find-donors"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              isActive('/find-donors')
                ? 'bg-primary-50 text-primary-600'
                : 'text-slate-700 hover:bg-slate-50'
            )}
          >
            <MapPin className="w-4 h-4" />
            Find Donors
          </Link>
          
          {user && navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive(to)
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-slate-700 hover:bg-slate-50'
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
              <ShieldCheck className="w-4 h-4" /> Admin
            </Link>
          )}
          {user && (
            <button
              onClick={() => { setMobileOpen(false); handleLogout() }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-red-50 mt-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
