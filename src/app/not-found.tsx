import { Button } from '@/components/ui/button'
import { Scale } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex justify-center items-center w-full min-h-screen px-4">
      <div className="flex flex-col gap-6 items-center text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center">
          <Scale className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="font-serif text-4xl text-primary">404</h2>
        <p className="text-muted-foreground text-lg">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
