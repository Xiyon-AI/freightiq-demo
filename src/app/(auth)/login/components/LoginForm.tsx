"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Lock, Eye, EyeOff, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function LoginForm() {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const searchParams = useSearchParams();

  const isVerified = searchParams.get("verified") === "true";
  const inviteAccepted = searchParams.get("invite") === "accepted";
  const invitePending = searchParams.get("invite") === "pending";
  const tokenError = searchParams.get("error");
  const callbackUrl = (() => {
    const value = searchParams.get("callbackUrl");
    return value && value.startsWith("/") ? value : null;
  })();

  void [setError, setLoading, callbackUrl];

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault() };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 sm:gap-5">
        {/* Email Verified Success */}
        {isVerified && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {t("auth.emailVerified")}
          </div>
        )}

        {/* Invite Accepted Success */}
        {inviteAccepted && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {t("auth.inviteAccepted")}
          </div>
        )}

        {invitePending && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {t("auth.invitePending")}
          </div>
        )}

        {/* Token Error */}
        {tokenError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {tokenError === "token_expired"
              ? t("auth.tokenExpired")
              : tokenError === "invalid_token"
              ? t("auth.invalidToken")
              : t("auth.verificationFailed")}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 text-center">
            {error}
          </div>
        )}

        {/* Email Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="email"
            name="email"
            placeholder={t("auth.emailPlaceholder")}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm sm:text-base rounded-2xl border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#FDE047] focus:border-transparent shadow-sm transition-all hover:bg-muted/30 hover:shadow-md focus:bg-card"
          />
        </div>

        {/* Password Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder={t("auth.passwordPlaceholder")}
            required
            className="w-full pl-11 pr-12 py-3 text-sm sm:text-base rounded-2xl border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#FDE047] focus:border-transparent shadow-sm transition-all hover:bg-muted/30 hover:shadow-md focus:bg-card"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-border text-foreground bg-card focus:ring-2 focus:ring-[#FDE047] focus:ring-offset-0 cursor-pointer"
          />
          <label htmlFor="rememberMe" className="text-xs sm:text-sm text-muted-foreground cursor-pointer">
            {t("auth.rememberEmail")}
          </label>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-foreground text-background font-semibold px-4 sm:px-6 py-3.5 text-sm sm:text-base rounded-2xl hover:bg-foreground/90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-foreground outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("auth.signingIn")}
            </>
          ) : (
            <>
              {t("auth.loginButton")}
              <ArrowRight size={18} className="sm:size-5" />
            </>
          )}
        </button>

        {/* Forgot Password & Register Links */}
        <div className="text-center mt-2 sm:mt-3 space-y-2">
          <Link
            href="/forgot-password"
            className="inline-block text-xs sm:text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            {t("auth.forgotPassword")}
          </Link>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link
              href="/register"
              className="text-foreground font-medium hover:underline transition-colors"
            >
              {t("auth.signUp")}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
