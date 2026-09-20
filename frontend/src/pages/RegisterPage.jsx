import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Heart } from 'lucide-react'
import { authApi } from '@/services/auth.api'
import useAuthStore from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input, InputLabel, InputError } from '@/components/ui/input'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['donor', 'recipient']),
  DOB: z.string().min(1, 'Date of birth is required'),
})

export default function RegisterPage() {
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'donor' },
  })

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (data) => {
    try {
      const res = await authApi.register(data)
      setUser(res.data.user)
      toast.success('Account created! Please complete your profile.')
      navigate('/my-profile')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-primary-500" />
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-primary-400" />
        </div>
        <div className="relative z-10 text-white text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-primary-400 fill-primary-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Join the Network</h1>
          <p className="text-white/70 text-lg max-w-xs">
            Register as a donor or recipient and start making a difference today.
          </p>
          <div className="mt-10 space-y-4 text-left">
            {[
              'Get matched with nearby donors',
              'Secure, private messaging',
              'Admin-verified donor profiles',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/80 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-lg">Pulse<span className="text-primary-500">Connect</span></span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h2>
          <p className="text-slate-500 mb-8">Join thousands of donors and recipients</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <InputLabel htmlFor="fullName" required>Full Name</InputLabel>
              <Input id="fullName" placeholder="John Doe" error={!!errors.fullName} {...register('fullName')} />
              <InputError message={errors.fullName?.message} />
            </div>
            <div>
              <InputLabel htmlFor="email" required>Email</InputLabel>
              <Input id="email" type="email" placeholder="you@example.com" error={!!errors.email} {...register('email')} />
              <InputError message={errors.email?.message} />
            </div>
            <div>
              <InputLabel htmlFor="password" required>Password</InputLabel>
              <Input id="password" type="password" placeholder="Min. 8 characters" error={!!errors.password} {...register('password')} />
              <InputError message={errors.password?.message} />
            </div>
            <div>
              <InputLabel htmlFor="DOB" required>Date of Birth</InputLabel>
              <Input id="DOB" type="date" error={!!errors.DOB} {...register('DOB')} />
              <InputError message={errors.DOB?.message} />
            </div>
            <div>
              <InputLabel required>I am a</InputLabel>
              <div className="flex gap-3 mt-1">
                {['donor', 'recipient'].map((r) => (
                  <label key={r} className="flex-1 cursor-pointer">
                    <input type="radio" value={r} {...register('role')} className="peer sr-only" />
                    <div className="border-2 border-slate-200 rounded-lg p-3 text-center text-sm font-medium capitalize text-slate-600 peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700 transition-all hover:border-slate-300">
                      {r}
                    </div>
                  </label>
                ))}
              </div>
              <InputError message={errors.role?.message} />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-600">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
