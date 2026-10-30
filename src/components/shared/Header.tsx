'use client';

import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import { useLanguage, type Locale } from '@/lib/i18n/LanguageContext';

export function Header() {
  const { locale, setLocale, t } = useLanguage();

  const locales: { value: Locale; label: string }[] = [
    { value: 'en', label: 'EN' },
    { value: 'bn', label: 'বাংলা' },
  ];

  return (
    <header className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: Logo and Support */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          <Link href="/" className="flex items-center">
            <Logo className="text-3xl mt-1" />
          </Link>
          <a href="mailto:support@freightiq.teamcmp.cloud" className="hidden sm:inline text-xs sm:text-xs lg:text-sm text-muted-foreground hover:text-foreground transition-colors">
            / Support@freightiq.teamcmp.cloud
          </a>
        </div>

        {/* Right: Navigation */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5 border border-border/50">
            {locales.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setLocale(value)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all duration-200 ${
                  locale === value
                    ? 'bg-[#FDE047] text-black shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Admin Link */}
          <a href="/admin" className="hidden sm:inline text-xs sm:text-sm text-foreground/80 hover:text-foreground transition-colors">Admin</a>

          {/* Get Started Button */}
          <Link
            href="/register"
            className="bg-[#FDE047] text-black font-semibold px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full hover:bg-[#FCD34D] transition-colors whitespace-nowrap"
          >
            {t('auth.getStarted')}
          </Link>
        </div>
      </div>
    </header>
  );
}
