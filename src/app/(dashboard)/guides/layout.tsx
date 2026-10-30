import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Demo Guide",
  description: "How to process rate confirmations in the FreightIQ broker demo",
  robots: {
    index: false,
    follow: false,
  },
}

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children
}
