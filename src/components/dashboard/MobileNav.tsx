'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Files } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { Logo } from '@/components/shared/Logo'
import { SidebarOrgSwitcher } from './SidebarOrgSwitcher'

interface NavItemProps {
  icon: React.ReactNode
  label: string
  href?: string
  badge?: string
  active?: boolean
  onClick?: () => void
  onPrefetch?: () => void
}

function NavItem({ icon, label, href = "#", badge, active, onClick, onPrefetch }: NavItemProps) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
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

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const prefetchRoute = useCallback(() => {}, [])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden shrink-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle mobile menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] flex flex-col p-0 bg-background">
        <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
                <Logo className="text-2xl" />
            </SheetTitle>
        </SheetHeader>
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <NavItem href="/documents" onClick={() => setOpen(false)} icon={<Files className="w-5 h-5" strokeWidth={2} />} label="Documents" active={pathname?.startsWith('/documents')} onPrefetch={prefetchRoute} />
        </nav>

        <div className="border-t border-border">
          <SidebarOrgSwitcher />
        </div>

      </SheetContent>
    </Sheet>
  )
}

