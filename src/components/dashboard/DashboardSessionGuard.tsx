'use client'

import type { ReactNode } from 'react'

export function DashboardSessionGuard({ children }: { children: ReactNode }) {
  // Session check removed for testing without login
  return <>{children}</>
}
