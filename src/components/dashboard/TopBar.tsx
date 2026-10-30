'use client'

import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { ChevronRight, HelpCircle, Settings, LogOut, Monitor, Moon, Sun, Check } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MobileNav } from './MobileNav'
import { useLanguage, type Locale } from '@/lib/i18n/LanguageContext'
import { useActiveOrg } from '@/components/providers/OrgProvider'

export function TopBar() {
  const pathname = usePathname()
  const { locale, setLocale, t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const { isPlatformAdmin } = useActiveOrg()
  const userEmail = 'alex.morgan@example.com'

  const handleThemeChange = (newTheme: 'system' | 'dark' | 'light') => {
    setTheme(newTheme)
  }

  const handleLogout = () => {}

  const getBreadcrumbs = () => {
    const segments = pathname?.split('/').filter(Boolean) || []
    return segments.map(segment => 
      segment.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    )
  }

  const breadcrumbs = getBreadcrumbs()

  const locales: { value: Locale; label: string }[] = [
    { value: 'en', label: 'EN' },
    { value: 'bn', label: 'বাংলা' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-30">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left Section: Logo + Breadcrumbs + Agent Selector */}
        <div className="flex items-center gap-2 md:gap-4">
          <MobileNav />
          {/* Logo */}
          <Link href="/knowledge" className="flex items-center gap-2 shrink-0">
            <Logo className="text-3xl" />
          </Link>

          {/* Current Page Breadcrumb */}
          {breadcrumbs.length > 0 && (
            <>
              <ChevronRight className="hidden lg:block w-4 h-4 text-neutral-400" />
              <span className="hidden lg:block text-sm text-neutral-600">
                {breadcrumbs[breadcrumbs.length - 1]}
              </span>
            </>
          )}
        </div>

        {/* Right Section: Navigation Links + Language Toggle + User Avatar */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Navigation Links */}
          <Link
            href="/guides"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-foreground transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t('topbar.getHelp')}</span>
          </Link>

          {isPlatformAdmin && (
            <a
              href="/admin"
              className="hidden md:flex items-center text-sm font-medium text-neutral-600 hover:text-foreground transition-colors"
            >
              Admin
            </a>
          )}

          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-neutral-100/80 rounded-lg p-0.5 border border-border/50">
            {locales.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setLocale(value)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all duration-200 ${
                  locale === value
                    ? 'bg-accent text-black shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-background/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* User Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-transparent hover:ring-primary-light transition-all">
                <AvatarImage src="https://api.dicebear.com/9.x/notionists/svg?seed=Felix" />
                <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                  AU
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>{t('topbar.settings')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1.5">
                {t('topbar.theme')}
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleThemeChange('system')} className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <span>{t('topbar.themeSystem')}</span>
                </div>
                {theme === 'system' && <Check className="w-4 h-4 text-accent" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('dark')} className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  <span>{t('topbar.themeDark')}</span>
                </div>
                {theme === 'dark' && <Check className="w-4 h-4 text-accent" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('light')} className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  <span>{t('topbar.themeLight')}</span>
                </div>
                {theme === 'light' && <Check className="w-4 h-4 text-accent" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('topbar.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
