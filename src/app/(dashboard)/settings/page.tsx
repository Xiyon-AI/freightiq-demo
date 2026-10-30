import AccountPageClient from './AccountPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your account settings, profile information, and organization preferences",
}

export default function AccountPage() {
  const user = { id: 'demo-user', email: 'alex.morgan@example.com' }
  const profile = {
    id: user.id,
    full_name: 'Alex Morgan',
    email: user.email,
  }
  const organizations = [{
    id: 'demo-org', name: 'Acme Support', slug: 'acme-support', plan: 'pro',
    status: 'active', created_at: '2026-01-15T12:00:00.000Z', role: 'admin',
  }]

  return <AccountPageClient initialProfile={profile} userEmail={user.email} initialOrganizations={organizations} />
}
