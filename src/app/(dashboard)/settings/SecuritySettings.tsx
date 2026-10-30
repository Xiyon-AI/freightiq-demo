'use client'

import { useState, useMemo } from 'react'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, Circle, Monitor, History, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'

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

export function SecuritySettings() {
  const { t } = useLanguage()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  void setIsChangingPassword

  // Password strength calculation
  const passedRules = useMemo(
    () => PASSWORD_RULES.filter((rule) => rule.test(newPassword)),
    [newPassword]
  );

  const strengthPercent = useMemo(
    () => (passedRules.length / PASSWORD_RULES.length) * 100,
    [passedRules]
  );

  const strengthLabel = useMemo(() => {
    if (newPassword.length === 0) return "";
    if (strengthPercent <= 20) return t("auth.strengthVeryWeak");
    if (strengthPercent <= 40) return t("auth.strengthWeak");
    if (strengthPercent <= 60) return t("auth.strengthFair");
    if (strengthPercent <= 80) return t("auth.strengthGood");
    return t("auth.strengthStrong");
  }, [newPassword, strengthPercent, t]);

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

  const handleChangePassword = async (e: React.FormEvent) => { e.preventDefault() }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground tracking-tight mb-2">{t('account.security') || 'Security'}</h2>
      
      {/* Change Password Card */}
      <div className="bg-card rounded-3xl border border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 md:p-8">
        <h3 className="text-lg font-bold text-foreground tracking-tight mb-6">{t('account.changePassword')}</h3>

        <form onSubmit={handleChangePassword} className="space-y-5">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5">
            <div>
              <label className="block text-[13px] font-medium text-gray-500 mb-1.5">{t('account.currentPassword')}</label>
              <div className="relative">
                <input 
                  type={showCurrentPassword ? "text" : "password"} 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border/80 pl-4 pr-10 py-2.5 text-sm font-medium text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-500 mb-1.5">{t('account.newPassword')}</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  className="w-full rounded-xl border border-border/80 pl-4 pr-10 py-2.5 text-sm font-medium text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {(passwordFocused || newPassword.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/50 mt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-muted-foreground">{t('auth.passwordStrength')}</span>
                      <span className={`text-xs font-bold ${strengthTextColor}`}>{strengthLabel}</span>
                    </div>
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden mb-4">
                      <motion.div 
                        className={`h-full ${strengthColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${strengthPercent}%` }}
                      />
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PASSWORD_RULES.map((rule) => (
                        <li key={rule.key} className="flex items-center gap-2">
                          {rule.test(newPassword) ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-muted-foreground/30" />
                          )}
                          <span className={`text-[11px] ${rule.test(newPassword) ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {t(rule.key)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[13px] font-medium text-gray-500 mb-1.5">{t('account.confirmNewPassword')}</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border/80 pl-4 pr-10 py-2.5 text-sm font-medium text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-start mt-6">
            <Button 
              type="submit" 
              disabled={isChangingPassword || !isPasswordStrong}
              className="bg-foreground hover:bg-foreground/90 text-background rounded-xl px-6 py-2.5 h-auto text-sm font-medium"
            >
              {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              {t('account.changePassword')}
            </Button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Browser Sessions Card */}
        <div className="bg-card rounded-3xl border border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 md:p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground tracking-tight">{t('account.sessions')}</h3>
            <span className="bg-yellow-400/10 text-yellow-600 dark:text-yellow-500 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">{t('settings.comingSoon')}</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/30 rounded-2xl border border-border/50">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 bg-background rounded-xl shrink-0">
                  <Monitor className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Chrome on MacOS</p>
                  <p className="text-xs font-medium text-green-600 dark:text-green-500 mt-0.5">{t('account.currentSession')}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-muted-foreground">San Francisco, USA</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full mt-4 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors gap-2 h-auto py-2.5">
            <LogOut className="w-4 h-4" />
            {t('account.logoutOther')}
          </Button>
        </div>

        {/* Security Log Card */}
        <div className="bg-card rounded-3xl border border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 md:p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground tracking-tight">{t('account.securityLog')}</h3>
            <span className="bg-yellow-400/10 text-yellow-600 dark:text-yellow-500 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">{t('settings.comingSoon')}</span>
          </div>
          
          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-2xl border border-border/40 border-dashed">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <History className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{t('account.noSecurityLogs')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
