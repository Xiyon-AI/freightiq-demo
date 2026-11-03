'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service (e.g., Sentry)
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-muted/30 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground dark:text-white">
                Something went wrong!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                We apologize for the inconvenience. An unexpected error has occurred.
              </p>
              {error.digest && (
                <p className="text-sm text-gray-500 dark:text-gray-500 font-mono">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-card dark:hover:bg-gray-100 text-white dark:text-foreground rounded-lg font-medium transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/documents'}
                className="px-6 py-3 bg-card hover:bg-muted/30 dark:bg-gray-800 dark:hover:bg-gray-700 text-foreground dark:text-white border border-border dark:border-gray-700 rounded-lg font-medium transition-colors"
              >
                Go to homepage
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
