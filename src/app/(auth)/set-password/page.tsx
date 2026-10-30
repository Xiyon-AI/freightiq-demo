'use client';

import { Suspense } from 'react';
import { Footer } from '@/components/shared/Footer';
import { Header } from '@/components/shared/Header';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { SetPasswordForm } from './components/SetPasswordForm';

export default function SetPasswordPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {t('auth.setPasswordEyebrow')}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t('auth.setPasswordTitle')}
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              {t('auth.setPasswordSubtitle')}
            </p>
          </div>

          <Suspense fallback={null}>
            <SetPasswordForm />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}