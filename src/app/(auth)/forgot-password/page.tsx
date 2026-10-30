'use client'

import { Header } from '@/components/shared/Header'
import { YellowCircleSVG } from '@/components/shared/YellowCircleSVG'
import { ArrowRight } from 'lucide-react'
import { ForgotPasswordForm } from './components/ForgotPasswordForm'
import { Footer } from '@/components/shared/Footer'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full flex flex-col items-center">
          {/* Brand CTA Section */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-1 sm:gap-2 bg-card px-3 sm:px-4 py-2 rounded-full border border-border shadow-sm mb-4">
              <span className="text-xs sm:text-sm text-muted-foreground">{t('auth.brandCta')}</span>
              <span className="hidden sm:inline text-xs sm:text-sm text-foreground/80 font-medium">{t('auth.brandCtaDesc')}</span>
              <ArrowRight size={14} sm-size={16} className="text-purple-500 flex-shrink-0" />
            </div>
          </div>

          {/* Main Heading */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-block mb-4 sm:mb-6">
              <YellowCircleSVG />
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground relative z-10">
                {t('auth.forgotPasswordTitle')} <br /> {t('auth.forgotPasswordTitleLine2')}
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              {t('auth.forgotPasswordSubtitle')}
            </p>
          </div>

          {/* Forgot Password Form Section */}
          <ForgotPasswordForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}
