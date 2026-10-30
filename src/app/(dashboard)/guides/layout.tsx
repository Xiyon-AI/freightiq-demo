import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Guide for the User",
  description: "Official guides for using FreightIQ AI Voice Agent",
  robots: {
    index: false,
    follow: false,
  },
}

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children
}
