import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Heart, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { authApi } from '@/services/auth.api'
import useAuthStore from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input, InputLabel, InputError } from '@/components/ui/input'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false)
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  if (user) {
    return <Navigate to={from} replace />
  }

  const onSubmit = async (data) => {
    try {
      const res = await authApi.login(data)
      setUser(res.data.user)
      toast.success(`Welcome back, ${res.data.user.fullName}!`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: illustration panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: `${(i+1)*80}px`, height: `${(i+1)*80}px`,
                top: `${20*i}%`, left: `${10+5*i}%`, opacity: 0.3 - i*0.04 }} />
          ))}
        </div>
        <div className="relative z-10 text-center text-white">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">PulseConnect</h1>
          <p className="text-white/80 text-lg max-w-xs">
            Connecting blood and organ donors with those who need them most.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6 text-center">
            {[['10k+','Donors'],['5k+','Matches'],['98%','Success']].map(([n,l])=>(
              <div key={l}>
                <div className="text-2xl font-bold">{n}</div>
                <div className="text-white/70 text-sm">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo (mobile) */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-lg">Pulse<span className="text-primary-500">Connect</span></span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <InputLabel htmlFor="email" required>Email</InputLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                error={!!errors.email}
                autoComplete="email"
                {...register('email')}
              />
              <InputError message={errors.email?.message} />
            </div>

            <div>
              <InputLabel htmlFor="password" required>Password</InputLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  error={!!errors.password}
                  autoComplete="current-password"
                  className="pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <InputError message={errors.password?.message} />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-500 hover:text-primary-600">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
