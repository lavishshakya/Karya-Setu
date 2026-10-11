import { ArrowLeft } from 'lucide-react'
import { LogoMark } from '@/components/brand/Logo'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <LogoMark size={56} className="mx-auto" />
        <p className="mt-6 text-gradient text-7xl font-extrabold tracking-tight">404</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">This bridge doesn’t lead anywhere</h1>
        <p className="mt-2 text-ink-2">The page you’re looking for has moved or never existed.</p>
        <Button to="/" icon={ArrowLeft} className="mt-6">
          Back to home
        </Button>
      </div>
    </div>
  )
}
