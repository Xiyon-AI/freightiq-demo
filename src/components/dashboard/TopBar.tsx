'use client'

import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { ChevronRight, HelpCircle, Monitor, Moon, Sun, Check, FlaskConical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MobileNav } from './MobileNav'
import { useLanguage, type Locale } from '@/lib/i18n/LanguageContext'

export function TopBar() {
  const pathname = usePathname()
  const { locale, setLocale, t } = useLanguage()
  const { theme, setTheme } = useTheme()

  const handleThemeChange = (newTheme: 'system' | 'dark' | 'light') => {
    setTheme(newTheme)
  }


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
        {/* Left Section: Logo + Page Breadcrumb */}
        <div className="flex items-center gap-2 md:gap-4">
          <MobileNav />
          {/* Logo */}
          <Link href="/documents" className="flex items-center gap-2 shrink-0">
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

        {/* Right Section: Demo guide + language + theme */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Navigation Links */}
          <Link
            href="/guides"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-foreground transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t('topbar.getHelp')}</span>
          </Link>

          {/* Language Toggle */}
          {/* <div className="flex items-center gap-1 bg-neutral-100/80 rounded-lg p-0.5 border border-border/50">
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
          </div> */}

          <span className="hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:flex"><FlaskConical className="h-3 w-3 text-primary"/>Demo</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground">
              {theme === 'dark' ? <Moon className="h-4 w-4"/> : <Sun className="h-4 w-4"/>}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">{t('topbar.theme')}</DropdownMenuItem>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
