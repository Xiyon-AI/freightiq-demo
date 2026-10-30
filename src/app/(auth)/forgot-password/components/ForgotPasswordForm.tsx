"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ForgotPasswordForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  void [setError, setLoading, setSuccess];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault() };

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
            {t("auth.checkEmail")}
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground mb-2">
            {t("auth.resetLinkSent")}
          </p>
          <p className="text-sm sm:text-base font-semibold text-foreground mb-6">
            {email}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mb-8">
            {t("auth.resetLinkExpiry")}
          </p>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            {t("auth.backToLogin")}
          </Link>
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-foreground text-background font-semibold px-4 sm:px-6 py-3.5 text-sm sm:text-base rounded-2xl hover:bg-foreground/90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-foreground outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("auth.sending")}
            </>
          ) : (
            t("auth.sendResetLink")
          )}
        </button>

        {/* Back to Login Link */}
        <div className="text-center mt-2 sm:mt-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <ArrowLeft size={14} />
            {t("auth.backToLogin")}
          </Link>
        </div>
      </form>
    </div>
  );
}
