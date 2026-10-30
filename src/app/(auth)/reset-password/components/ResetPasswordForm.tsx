"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Check,
  Circle,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const PASSWORD_RULES = [
  { key: "auth.passwordRule1", test: (pw: string) => pw.length >= 8 },
  { key: "auth.passwordRule2", test: (pw: string) => /[A-Z]/.test(pw) },
  { key: "auth.passwordRule3", test: (pw: string) => /[a-z]/.test(pw) },
  { key: "auth.passwordRule4", test: (pw: string) => /[0-9]/.test(pw) },
  {
    key: "auth.passwordRule5",
    test: (pw: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
  },
];

export function ResetPasswordForm() {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const tokenError = searchParams.get("error");

  // Password strength calculation
  const passedRules = useMemo(
    () => PASSWORD_RULES.filter((rule) => rule.test(password)),
    [password]
  );

  const strengthPercent = useMemo(
    () => (passedRules.length / PASSWORD_RULES.length) * 100,
    [passedRules]
  );

  const strengthLabel = useMemo(() => {
    if (password.length === 0) return "";
    if (strengthPercent <= 20) return t("auth.strengthVeryWeak");
    if (strengthPercent <= 40) return t("auth.strengthWeak");
    if (strengthPercent <= 60) return t("auth.strengthFair");
    if (strengthPercent <= 80) return t("auth.strengthGood");
    return t("auth.strengthStrong");
  }, [password, strengthPercent, t]);

  const strengthColor = useMemo(() => {
    if (strengthPercent <= 20) return "bg-red-500";
    if (strengthPercent <= 40) return "bg-orange-500";
    if (strengthPercent <= 60) return "bg-yellow-500";
    if (strengthPercent <= 80) return "bg-blue-500";
    return "bg-green-500";
  }, [strengthPercent]);

  const strengthTextColor = useMemo(() => {
    if (strengthPercent <= 20) return "text-red-600";
    if (strengthPercent <= 40) return "text-orange-600";
    if (strengthPercent <= 60) return "text-yellow-600";
    if (strengthPercent <= 80) return "text-blue-600";
    return "text-green-600";
  }, [strengthPercent]);

  const isPasswordStrong = passedRules.length === PASSWORD_RULES.length;

  void [setError, setLoading, setSuccess, router, token];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault() };

  // Show error if token is invalid
  if (tokenError) {
    return (
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-red-900 mb-2">{t("auth.invalidResetLink")}</h2>
          <p className="text-sm text-red-700 mb-4">
            {tokenError === "token_expired"
              ? t("auth.resetLinkExpiredDesc")
              : t("auth.resetLinkInvalidDesc")}
          </p>
          <Link
            href="/forgot-password"
            className="inline-block bg-black text-white font-semibold px-6 py-3 text-sm rounded-2xl hover:bg-gray-900 transition-colors"
          >
            {t("auth.requestNewLink")}
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12"
      >
        <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
            className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
          >
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </motion.div>

          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
            {t("auth.passwordResetSuccess")}
          </h2>

          <p className="text-sm sm:text-base text-gray-600 mb-6">
            {t("auth.passwordResetSuccessDesc")}
          </p>

          <p className="text-xs text-gray-500">
            {t("auth.redirectingToLogin")}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Password Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder={t("auth.newPasswordPlaceholder")}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            className="w-full pl-11 pr-12 py-3 text-sm sm:text-base rounded-2xl border border-border bg-card text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FDE047] focus:border-transparent shadow-sm transition-all hover:bg-muted/30 hover:shadow-md focus:bg-card"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Password Strength Indicator */}
        <AnimatePresence>
          {(passwordFocused || password.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-muted/30 rounded-2xl border border-border/50 p-4 space-y-3">
                {/* Strength Bar */}
                {password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">
                        {t("auth.passwordStrength")}
                      </span>
                      <span
                        className={`text-xs font-semibold ${strengthTextColor}`}
                      >
                        {strengthLabel}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${strengthColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${strengthPercent}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}

                {/* Requirements Checklist */}
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-gray-500">
                    {t("auth.requirements")}
                  </span>
                  <ul className="space-y-1">
                    {PASSWORD_RULES.map((rule, i) => {
                      const passed = rule.test(password);
                      return (
                        <li
                          key={i}
                          className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                            passed ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          {passed ? (
                            <Check className="h-3.5 w-3.5 shrink-0" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 shrink-0" />
                          )}
                          {t(rule.key)}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirm Password Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder={t("auth.confirmPasswordPlaceholder")}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-11 pr-12 py-3 text-sm sm:text-base rounded-2xl border border-border bg-card text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FDE047] focus:border-transparent shadow-sm transition-all hover:bg-muted/30 hover:shadow-md focus:bg-card"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isPasswordStrong}
          className="w-full mt-2 bg-black text-white font-semibold px-4 sm:px-6 py-3.5 text-sm sm:text-base rounded-2xl hover:bg-gray-900 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-black outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("auth.resettingPassword")}
            </>
          ) : (
            t("auth.resetPasswordButton")
          )}
        </button>

        {/* Back to Login Link */}
        <div className="text-center mt-2 sm:mt-3">
          <Link
            href="/login"
            className="text-xs sm:text-sm text-gray-600 hover:text-foreground font-medium transition-colors"
          >
            {t("auth.backToLogin")}
          </Link>
        </div>
      </form>
    </div>
  );
}
