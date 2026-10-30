'use client'

import { Header } from '@/components/shared/Header'
import { YellowCircleSVG } from '@/components/shared/YellowCircleSVG'

import { Suspense } from 'react'
import { LoginForm } from './components/LoginForm'
import { Footer } from '@/components/shared/Footer'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function LoginPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full flex flex-col items-center">


          {/* Main Heading */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-block mb-4 sm:mb-6">
              <YellowCircleSVG />
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground relative z-10">
                {t('auth.loginTitle')} <br /> {t('auth.loginTitleLine2')}
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {/* Login Form Section */}
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  )
}
