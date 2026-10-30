import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Register",
  description: "Create your FreightIQ account and start using AI-powered voice agents for your business",
  robots: {
    index: false,
    follow: false,
  },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
