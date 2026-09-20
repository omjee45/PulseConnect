import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center mb-6">
        <Heart className="w-10 h-10 text-primary-300" />
      </div>
      <h1 className="text-6xl font-bold text-slate-200 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-slate-900 mb-3">Page Not Found</h2>
      <p className="text-slate-500 max-w-sm mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/home">
        <Button>Go back home</Button>
      </Link>
    </div>
  )
}
