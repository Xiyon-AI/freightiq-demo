'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Home, Inbox, Files, Workflow, BookOpen, ChartNoAxesColumn, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { useLanguage } from '@/lib/i18n/LanguageContext'
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
  const { t } = useLanguage()

  const prefetchRoute = useCallback((_href: string) => {}, [])

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
          <NavItem href="/operations" onClick={() => setOpen(false)} icon={<Home className="w-5 h-5" strokeWidth={2} />} label="Home" active={pathname?.startsWith('/operations')} onPrefetch={() => prefetchRoute('/operations')} />
          <NavItem href="/intake" onClick={() => setOpen(false)} icon={<Inbox className="w-5 h-5" strokeWidth={2} />} label="Intake" active={pathname?.startsWith('/intake')} onPrefetch={() => prefetchRoute('/intake')} />
          <NavItem href="/knowledge" onClick={() => setOpen(false)} icon={<Files className="w-5 h-5" strokeWidth={2} />} label="Documents" active={pathname?.startsWith('/knowledge')} onPrefetch={() => prefetchRoute('/knowledge')} />
          <NavItem href="/automation" onClick={() => setOpen(false)} icon={<Workflow className="w-5 h-5" strokeWidth={2} />} label="Automation" active={pathname?.startsWith('/automation')} onPrefetch={() => prefetchRoute('/automation')} />
          <NavItem href="/knowledge" onClick={() => setOpen(false)} icon={<BookOpen className="w-5 h-5" strokeWidth={2} />} label="Knowledge" active={pathname?.startsWith('/knowledge')} onPrefetch={() => prefetchRoute('/knowledge')} />
          <NavItem href="/analytics" onClick={() => setOpen(false)} icon={<ChartNoAxesColumn className="w-5 h-5" strokeWidth={2} />} label="Analytics" active={pathname?.startsWith('/analytics')} onPrefetch={() => prefetchRoute('/analytics')} />
          <NavItem href="/settings" onClick={() => setOpen(false)} icon={<Settings className="w-5 h-5" strokeWidth={2} />} label="Settings" active={pathname?.startsWith('/settings')} onPrefetch={() => prefetchRoute('/settings')} />
        </nav>

        <div className="border-t border-border">
          <SidebarOrgSwitcher />
        </div>

        {/* Usage Card */}
        {/* <div className="p-4 border-t border-border">
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">{t('sidebar.starterUsage')}</span>
              <span className="text-xs text-neutral-500">{t('sidebar.free')}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600">{t('sidebar.storage')}</span>
                <span className="text-foreground font-medium">2.5 / 5 GB</span>
              </div>
              <Progress value={50} className="h-1.5" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600">{t('sidebar.apiCalls')}</span>
                <span className="text-foreground font-medium">1.2k / 10k</span>
              </div>
              <Progress value={12} className="h-1.5" />
            </div>

            <Link 
              href="/upgrade" 
              onClick={() => setOpen(false)}
              className="block w-full text-center px-3 py-2 bg-accent hover:bg-accent-hover text-black text-xs font-bold rounded-md transition-colors mt-3 shadow-sm"
            >
              {t('sidebar.upgradePlan')}
            </Link>
          </div>
        </div> */}
      </SheetContent>
    </Sheet>
  )
}

