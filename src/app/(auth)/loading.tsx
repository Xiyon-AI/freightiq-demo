import { Loader2 } from 'lucide-react'

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
