import { Link } from 'react-router-dom'
import { Heart, MapPin, MessageSquare, Shield, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useAuthStore from '@/store/authStore'

const features = [
  {
    icon: MapPin,
    title: 'Find Nearby Donors',
    description: 'Discover verified blood and organ donors in your city using real-time geolocation.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: MessageSquare,
    title: 'Private Messaging',
    description: 'Connect and chat securely with donors or recipients once your request is accepted.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Shield,
    title: 'Verified Donors',
    description: 'Every donor on the platform is verified by our admin team for your safety.',
    color: 'bg-green-50 text-green-600',
  },
]

export default function HomePage() {
 
  const { user, isLoading } = useAuthStore()

  
  const primaryHref   = user ? '/dashboard'     : '/register'
  const primaryLabel  = user ? 'Go to Dashboard' : 'Join as Donor'
  const secondaryHref = user ? '/find-donors' : '/register'
  const ctaHref       = user ? '/dashboard'     : '/register'
  const ctaLabel      = user ? 'Go to Dashboard' : 'Get Started for Free'

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-500" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-primary-400" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-500/30 rounded-full px-4 py-2 text-sm text-primary-300 mb-6">
            <Heart className="w-3.5 h-3.5 fill-current" />
            India&apos;s Donor Network
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
            Every Drop Counts.
            <span className="text-primary-400 block mt-1">Every Organ Matters.</span>
          </h1>
          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            PulseConnect bridges the gap between blood and organ donors and those who need them.
            Fast, verified, and private.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={primaryHref}>
              <Button size="lg" className="w-full sm:w-auto gap-2" disabled={isLoading}>
                {primaryLabel} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to={secondaryHref}>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20"
                disabled={isLoading}
              >
                {user ? 'Find Nearby Donors' : 'Find a Donor'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-slate-100 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[['10,000+','Registered Donors'],['5,000+','Successful Matches'],['50+','Cities Covered'],['98%','Satisfaction Rate']].map(([n,l])=>(
            <div key={l}>
              <div className="text-3xl font-bold text-primary-500">{n}</div>
              <div className="text-slate-500 text-sm mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">How It Works</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              A safe, simple, and effective platform designed around saving lives.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary-500">
        <div className="max-w-3xl mx-auto text-center text-white">
          <Heart className="w-12 h-12 fill-white/30 text-white mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-3">Ready to make a difference?</h2>
          <p className="text-white/80 mb-8">Join PulseConnect today and be part of something greater.</p>
          {/* BUG FIX: was hardcoded to /register for logged-in users too */}
          <Link to={ctaHref}>
            <Button size="lg" variant="outline" className="bg-white text-primary-600 border-white hover:bg-white/90" disabled={isLoading}>
              {ctaLabel}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-6 text-center text-sm">
        <p>© 2026 PulseConnect. Saving lives, one connection at a time. 🩸</p>
      </footer>
    </div>
  )
}
