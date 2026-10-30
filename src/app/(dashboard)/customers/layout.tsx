import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Customers",
  description: "View and manage your customer database connections and data",
  robots: {
    index: false,
    follow: false,
  },
}

export default function CustomersLayout({ children }: { children: React.ReactNode }) {
  return children
}
