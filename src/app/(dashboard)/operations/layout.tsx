import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Operations",
  description: "Monitor live operations, system health, and real-time events for your voice agents",
  robots: {
    index: false,
    follow: false,
  },
}

export default function OperationsLayout({ children }: { children: React.ReactNode }) {
  return children
}
