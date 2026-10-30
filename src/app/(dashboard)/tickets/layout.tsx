import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Support Tickets",
  description: "Manage customer support tickets and inquiries",
  robots: {
    index: false,
    follow: false,
  },
}

export default function TicketsLayout({ children }: { children: React.ReactNode }) {
  return children
}
