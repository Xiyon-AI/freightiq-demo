'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  Check,
  Circle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const PASSWORD_RULES = [
  { key: 'auth.passwordRule1', test: (pw: string) => pw.length >= 8 },
  { key: 'auth.passwordRule2', test: (pw: string) => /[A-Z]/.test(pw) },
  { key: 'auth.passwordRule3', test: (pw: string) => /[a-z]/.test(pw) },
  { key: 'auth.passwordRule4', test: (pw: string) => /[0-9]/.test(pw) },
  {
    key: 'auth.passwordRule5',
    test: (pw: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(pw),
  },
];

const SUPPORT_EMAIL = 'support@freightiq.teamcmp.cloud';

type TranslateFn = (key: string) => string;

type InviteFatalErrorCode =
  | 'missing_token'
  | 'token_invalid'
  | 'token_expired'
  | 'token_used'
  | 'user_not_found';

function normalizeInviteFatalErrorCode(
  code: string | null | undefined
): InviteFatalErrorCode | null {
  switch (code) {
    case 'missing_token':
    case 'token_invalid':
    case 'token_expired':
    case 'token_used':
    case 'user_not_found':
      return code;
    default:
      return null;
  }
}

function getInviteFatalState(code: InviteFatalErrorCode, t: TranslateFn) {
  switch (code) {
    case 'token_expired':
      return {
        tone: 'amber' as const,
        title: t('auth.expiredInviteLink'),
        description: t('auth.inviteLinkExpiredDesc'),
      };
    case 'token_used':
      return {
        tone: 'amber' as const,
        title: t('auth.usedInviteLink'),
        description: t('auth.inviteLinkUsedDesc'),
      };
    case 'user_not_found':
      return {
        tone: 'destructive' as const,
        title: t('auth.invitedUserUnavailable'),
        description: t('auth.invitedUserUnavailableDesc'),
      };
    case 'missing_token':
    case 'token_invalid':
    default:
      return {
        tone: 'amber' as const,
        title: t('auth.invalidInviteLink'),
        description: t('auth.inviteLinkInvalidDesc'),
      };
  }
}

export function SetPasswordForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = (searchParams.get('email') ?? '').trim();
  const callbackUrl = searchParams.get('callbackUrl');
  const queryFatalErrorCode = normalizeInviteFatalErrorCode(searchParams.get('error'));

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fatalErrorCode, setFatalErrorCode] = useState<InviteFatalErrorCode | null>(null);
  const [loading, setLoading] = useState(false);

  const passedRules = useMemo(
    () => PASSWORD_RULES.filter((rule) => rule.test(password)),
    [password]
  );
  const isPasswordStrong = passedRules.length === PASSWORD_RULES.length;
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const resolvedFatalErrorCode = fatalErrorCode ?? queryFatalErrorCode ?? (!token ? 'missing_token' : null);
  const fatalState = resolvedFatalErrorCode
    ? getInviteFatalState(resolvedFatalErrorCode, t)
    : null;

  void [router, callbackUrl, setError, setFatalErrorCode, setLoading];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault() }

  if (fatalState) {
    const toneClasses =
      fatalState.tone === 'destructive'
        ? 'border-destructive/20 bg-destructive/5 text-destructive'
        : 'border-amber-200 bg-amber-50 text-amber-800';

    return (
      <Card className="border shadow-sm">
        <CardContent className="space-y-5 py-1">
          {email ? (
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('auth.invitedEmailLabel')}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{email}</span>
              </div>
            </div>
          ) : null}

          <div role="alert" className={`rounded-lg border px-4 py-3 text-sm ${toneClasses}`}>
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-1">
                <p className="font-medium">{fatalState.title}</p>
                <p>{fatalState.description}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">{t('auth.backToLogin')}</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <a href={`mailto:${SUPPORT_EMAIL}`}>{t('auth.contactSupport')}</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="space-y-5 py-1">
        {email ? (
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('auth.invitedEmailLabel')}
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{email}</span>
            </div>
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.newPasswordPlaceholder')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t('auth.newPasswordPlaceholder')}
                className="h-10 pl-9 pr-10"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('auth.confirmPasswordPlaceholder')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                className="h-10 pl-9 pr-10"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch ? (
              <p className="text-sm text-destructive">{t('auth.passwordsNoMatch')}</p>
            ) : null}
          </div>

          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('auth.requirements')}
            </div>
            <ul className="space-y-1.5">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(password);

                return (
                  <li
                    key={rule.key}
                    className={`flex items-center gap-2 text-sm ${
                      passed ? 'text-green-700' : 'text-muted-foreground'
                    }`}
                  >
                    {passed ? (
                      <Check className="h-4 w-4 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{t(rule.key)}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <Button
            type="submit"
            className={`h-10 w-full ${
              isPasswordStrong && passwordsMatch
                ? 'bg-[#FDE047] text-slate-950 hover:bg-[#facc15] focus-visible:ring-[#FDE047]/40 shadow-[0_10px_30px_-16px_rgba(250,204,21,0.9)]'
                : 'bg-muted text-muted-foreground hover:bg-muted'
            }`}
            disabled={loading || !isPasswordStrong || !passwordsMatch}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('auth.completingInvite')}
              </>
            ) : (
              t('auth.completeInviteButton')
            )}
          </Button>
        </form>

        <div className="flex flex-col gap-2 text-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('auth.backToLogin')}
          </Link>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('auth.contactSupport')}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
