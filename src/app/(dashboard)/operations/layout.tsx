import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Broker Operations",
  description: "Monitor rate confirmation intake, review exceptions, and mock TMS handoffs",
  robots: {
    index: false,
    follow: false,
  },
}

export default function OperationsLayout({ children }: { children: React.ReactNode }) {
  return children
}
