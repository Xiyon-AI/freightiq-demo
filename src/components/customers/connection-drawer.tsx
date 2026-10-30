'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Database, Eye, EyeOff, Loader2, Plug, Trash2, Info, CheckCircle2, XCircle, ServerCrash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { toast } from 'sonner'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import type { ExternalDbConnectionMasked, ConnectionFormValues } from '@/lib/types/customer-db'

const connectionSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.coerce.number().int().min(1).max(65535),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  database_name: z.string().min(1, 'Database name is required'),
  table_or_view: z.string().min(1, 'Table or view name is required'),
})

interface ConnectionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
  connection: ExternalDbConnectionMasked | null
  onSaved: () => void
  onDeleted: () => void
}

export function ConnectionDrawer({
  open,
  onOpenChange,
  organizationId,
  connection,
  onSaved,
  onDeleted,
}: ConnectionDrawerProps) {
  const { t } = useLanguage()
  const [showPassword, setShowPassword] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [testResult, setTestResult] = useState<{ status: string; message: string } | null>(null)
  void [organizationId, onSaved, onDeleted, setIsTesting, setIsSaving]

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionSchema as any),
    defaultValues: {
      host: '',
      port: 3306,
      username: '',
      password: '',
      database_name: '',
      table_or_view: '',
    },
  })

  useEffect(() => {
    if (connection) {
      reset({
        host: connection.host,
        port: connection.port,
        username: connection.username,
        password: '',
        database_name: connection.database_name,
        table_or_view: connection.table_or_view,
      })
    } else {
      reset({
        host: '',
        port: 3306,
        username: '',
        password: '',
        database_name: '',
        table_or_view: '',
      })
    }
    setTestResult(null)
    setShowPassword(false)
  }, [connection, open, reset])

  const onSubmit = async (_data: ConnectionFormValues) => {}

  const handleTest = async () => {
    if (!connection) {
      toast.error(t('customerDb.saveFirst'))
      return
    }
    setTestResult({ status: 'connected', message: 'Demo connection is ready.' })
  }

  const handleDelete = async () => {
    if (!connection) return
    setIsDeleting(false)
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 bg-muted/30/50 border ${
      hasError
        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-400/20'
        : 'border-border/80 focus:border-gray-300 focus:ring-gray-200'
    } rounded-xl text-sm focus:outline-none focus:ring-4 transition-all text-foreground font-medium placeholder:text-gray-400`

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-lg sm:max-w-lg overflow-y-auto">
        <SheetHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gray-900 flex items-center justify-center shadow-lg">
              <Database className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-foreground tracking-tight">
                {connection ? t('customerDb.editConnection') : t('customerDb.connectDatabase')}
              </SheetTitle>
              <SheetDescription className="text-[13px] text-gray-500 mt-0.5">
                {t('customerDb.connectDesc')}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Firewall info banner */}
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60">
          <div className="flex gap-3">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
            <div>
              <p className="text-[13px] font-semibold text-amber-800">{t('customerDb.firewallTitle')}</p>
              <p className="text-[12px] text-amber-700 mt-1">{t('customerDb.firewallDesc')}</p>
              <code className="mt-2 inline-block px-3 py-1.5 bg-amber-100/80 rounded-lg text-[13px] font-mono font-bold text-amber-900 select-all">
                {process.env.NEXT_PUBLIC_OUTBOUND_IP ?? '213.182.92.188'}
              </code>
            </div>
          </div>
        </div>

        {/* Connection status badge */}
        {connection && (
          <div className="mx-6 mt-3">
            <StatusIndicator status={connection.connection_status} testResult={testResult} />
          </div>
        )}

        <form id="connection-form" onSubmit={handleSubmit(onSubmit)} className="px-6 mt-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                {t('customerDb.host')} <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('host')}
                className={inputClass(!!errors.host)}
                placeholder="db.example.com"
              />
              {errors.host && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.host.message}</p>}
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                {t('customerDb.port')} <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('port')}
                type="number"
                className={inputClass(!!errors.port)}
                placeholder="3306"
              />
              {errors.port && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.port.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t('customerDb.username')} <span className="text-rose-500">*</span>
            </label>
            <input
              {...register('username')}
              className={inputClass(!!errors.username)}
              placeholder="readonly_user"
              autoComplete="off"
            />
            {errors.username && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t('customerDb.password')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className={inputClass(!!errors.password) + ' pr-11'}
                placeholder={connection ? '••••••••' : 'Enter password'}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t('customerDb.databaseName')} <span className="text-rose-500">*</span>
            </label>
            <input
              {...register('database_name')}
              className={inputClass(!!errors.database_name)}
              placeholder="mystaff_show"
            />
            {errors.database_name && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.database_name.message}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              {t('customerDb.tableOrView')} <span className="text-rose-500">*</span>
            </label>
            <input
              {...register('table_or_view')}
              className={inputClass(!!errors.table_or_view)}
              placeholder="companies"
            />
            {errors.table_or_view && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.table_or_view.message}</p>}
            <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
              {t('customerDb.tableOrViewHint')}
            </p>
          </div>
        </form>

        <SheetFooter className="px-6 pb-6 pt-4 mt-4 border-t border-border/50/80 flex-col gap-3">
          <div className="flex gap-2 w-full">
            {connection && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleTest}
                disabled={isTesting}
                className="flex-1 rounded-xl font-bold text-[13px] h-11 border border-border/80 hover:bg-muted/30"
              >
                {isTesting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plug className="w-4 h-4 mr-2" />
                )}
                {t('customerDb.testConnection')}
              </Button>
            )}
            <Button
              type="submit"
              form="connection-form"
              disabled={isSaving}
              className="flex-1 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-[13px] h-11 shadow-md hover:shadow-lg transition-all"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {connection ? t('customerDb.updateConnection') : t('customerDb.saveConnection')}
            </Button>
          </div>
          {connection && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full rounded-xl font-bold text-[13px] h-10 text-rose-600 hover:text-rose-700 hover:bg-rose-50/80"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {t('customerDb.deleteConnection')}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function StatusIndicator({
  status,
  testResult,
}: {
  status: string
  testResult: { status: string; message: string } | null
}) {
  const displayStatus = testResult?.status || status

  if (displayStatus === 'connected') {
    return (
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/60">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
        <span className="text-[13px] font-semibold text-emerald-700">Connected</span>
        {testResult?.message && (
          <span className="text-[12px] text-emerald-600 ml-auto">{testResult.message}</span>
        )}
      </div>
    )
  }

  if (displayStatus === 'failed') {
    return (
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50/80 border border-rose-200/60">
        <XCircle className="w-4 h-4 text-rose-600" strokeWidth={2.5} />
        <span className="text-[13px] font-semibold text-rose-700">Connection Failed</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-muted/30/80 border border-border/60">
      <ServerCrash className="w-4 h-4 text-gray-400" strokeWidth={2.5} />
      <span className="text-[13px] font-semibold text-gray-500">Not Tested</span>
    </div>
  )
}
