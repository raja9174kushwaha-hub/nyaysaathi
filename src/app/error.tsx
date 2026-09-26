'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex justify-center items-center w-full min-h-screen px-4">
      <div className="flex flex-col gap-6 items-center text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-risk-danger/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-risk-danger" />
        </div>
        <h2 className="font-serif text-3xl text-primary">Something went wrong</h2>
        <p className="text-muted-foreground text-base leading-relaxed">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <Button onClick={reset} size="lg">
          Try Again
        </Button>
      </div>
    </div>
  )
}
