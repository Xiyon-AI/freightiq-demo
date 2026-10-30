"use client";

import { useState, useMemo } from "react";
import {
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  User,
  Mail,
  Loader2,
  CheckCircle2,
  X,
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

export function RegisterForm() {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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
    if (strengthPercent <= 20) return "bg-error";
    if (strengthPercent <= 40) return "bg-warning";
    if (strengthPercent <= 60) return "bg-accent";
    if (strengthPercent <= 80) return "bg-info";
    return "bg-success";
  }, [strengthPercent]);

  const strengthTextColor = useMemo(() => {
    if (strengthPercent <= 20) return "text-error";
    if (strengthPercent <= 40) return "text-warning";
    if (strengthPercent <= 60) return "text-accent";
    if (strengthPercent <= 80) return "text-info";
    return "text-success";
  }, [strengthPercent]);

  const isPasswordStrong = passedRules.length === PASSWORD_RULES.length;

  void [setError, setLoading, setRegisteredEmail];

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault() };

  return (
    <>
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <form
          onSubmit={handleRegister}
          className="flex flex-col gap-4 sm:gap-5"
        >
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3 text-center">
              {error}
            </div>
          )}

          {/* Full Name Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              name="fullName"
              placeholder={t("auth.fullNamePlaceholder")}
              required
              className="w-full pl-11 pr-4 py-3 text-sm sm:text-base rounded-2xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent shadow-sm transition-all hover:bg-muted/30 hover:shadow-md focus:bg-background"
            />
          </div>

          {/* Email Address Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="email"
              name="email"
              placeholder={t("auth.emailPlaceholder")}
              required
              className="w-full pl-11 pr-4 py-3 text-sm sm:text-base rounded-2xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent shadow-sm transition-all hover:bg-muted/30 hover:shadow-md focus:bg-background"
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
              placeholder={t("auth.createPasswordPlaceholder")}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
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
                        <span className="text-xs font-medium text-muted-foreground">
                          {t("auth.passwordStrength")}
                        </span>
                        <span
                          className={`text-xs font-semibold ${strengthTextColor}`}
                        >
                          {strengthLabel}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
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
                    <span className="text-xs font-medium text-muted-foreground">
                      {t("auth.requirements")}
                    </span>
                    <ul className="space-y-1">
                      {PASSWORD_RULES.map((rule, i) => {
                        const passed = rule.test(password);
                        return (
                          <li
                            key={i}
                            className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                              passed ? "text-success" : "text-muted-foreground"
                            }`}
                          >
                            {passed ? (
                              <Check className="h-3.5 w-3.5 flex-shrink-0" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 flex-shrink-0" />
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

          {/* Terms and Conditions Checkbox */}
          <div className="flex items-start gap-3 mt-2">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-foreground bg-card focus:ring-2 focus:ring-accent focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs sm:text-sm text-muted-foreground cursor-pointer">
              {t("auth.agreeTerms")}{" "}
              <Link
                href="/terms-and-conditions"
                target="_blank"
                className="text-foreground font-medium hover:underline"
              >
                {t("auth.termsAndConditions")}
              </Link>
            </label>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading || !isPasswordStrong || !acceptedTerms}
            className="w-full mt-2 bg-foreground text-background font-semibold px-4 sm:px-6 py-3.5 text-sm sm:text-base rounded-2xl hover:bg-foreground/90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-foreground outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t("auth.creatingAccount")}
              </>
            ) : (
              <>
                {t("auth.createAccountButton")}
                <ArrowRight size={18} className="sm:size-5" />
              </>
            )}
          </button>

          {/* Login Link */}
          <div className="text-center mt-2 sm:mt-3">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("auth.haveAccount")}{" "}
              <Link
                href="/login"
                className="text-foreground font-medium hover:underline transition-colors"
              >
                {t("auth.signIn")}
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Email Verification Modal */}
      <AnimatePresence>
        {showVerifyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowVerifyModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="relative bg-background rounded-3xl shadow-2xl p-8 sm:p-10 max-w-md w-full text-center"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowVerifyModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                className="mx-auto mb-6 w-16 h-16 bg-success-light rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="h-8 w-8 text-success" />
              </motion.div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                {t("auth.checkEmail")}
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-muted-foreground mb-2">
                {t("auth.verificationSent")}
              </p>
              <p className="text-sm sm:text-base font-semibold text-foreground mb-6">
                {registeredEmail}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mb-8">
                {t("auth.clickVerifyLink")}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  className="w-full bg-foreground text-background font-semibold px-6 py-3.5 text-sm rounded-2xl hover:bg-foreground/90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                >
                  {t("auth.goToLogin")}
                  <ArrowRight size={16} />
                </Link>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  {t("auth.close")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
