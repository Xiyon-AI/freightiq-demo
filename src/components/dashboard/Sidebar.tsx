'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { Files } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { SidebarOrgSwitcher } from './SidebarOrgSwitcher'

interface NavItemProps {
  icon: React.ReactNode
  label: string
  href?: string
  badge?: string
  active?: boolean
  onPrefetch?: () => void
}

function NavItem({ icon, label, href = "#", badge, active, onPrefetch }: NavItemProps) {
  return (
    <Link 
      href={href} 
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      className={`w-full relative flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-accent-light text-foreground' : 'text-neutral-700 hover:bg-muted/30'}`}
    >
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-r-full shadow-[2px_0_8px_rgba(253,224,71,0.6)]" />
      )}
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      {badge && (
        <span className="px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700 text-xs font-medium">
          {badge}
        </span>
      )}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  // Prefetch dashboard routes on hover.
  const prefetchRoute = useCallback(() => {}, [])

  return (
    <aside className="hidden md:flex w-64 border-r border-border bg-background flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto z-20">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <NavItem href="/documents" icon={<Files className="w-5 h-5" strokeWidth={2} />} label="Documents" active={pathname?.startsWith('/documents')} onPrefetch={prefetchRoute} />
      </nav>

      {/* Active organization switcher */}
      <div className="border-t border-border">
        <SidebarOrgSwitcher />
      </div>

    </aside>
  )
}

