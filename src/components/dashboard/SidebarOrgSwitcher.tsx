'use client'

import { useState } from 'react'
import { Building2, Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useActiveOrg } from '@/components/providers/OrgProvider'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { cn } from '@/lib/utils'

export function SidebarOrgSwitcher() {
  const { t } = useLanguage()
  const { activeOrg, organizations, switching, setActiveOrg, loading } = useActiveOrg()
  const [open, setOpen] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)

  if (loading || !activeOrg) {
    return (
      <div className="px-3 py-3">
        <div className="h-12 w-full rounded-xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  const others = organizations.filter((o) => o.id !== activeOrg.id)

  const handleSelect = async (orgId: string) => {
    if (orgId === activeOrg.id || switching) return
    try {
      setPendingId(orgId)
      await setActiveOrg(orgId)
      const switched = organizations.find((o) => o.id === orgId)
      toast.success(`Switched to ${switched?.name ?? 'organization'}`)
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to switch organization')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="px-3 py-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="group flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2.5 text-left transition-colors hover:border-border hover:bg-muted/40"
            aria-label={t('sidebar.switchOrganization') || 'Switch organization'}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-yellow-300">
              <Building2 className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t('sidebar.activeOrganization') || 'Active organization'}
              </span>
              <span className="block truncate text-sm font-semibold text-foreground">
                {activeOrg.name}
              </span>
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="top"
          sideOffset={8}
          className="w-[15rem] gap-1 p-1.5"
        >
          <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t('sidebar.switchOrganization') || 'Switch organization'}
          </div>
          <div className="max-h-72 overflow-y-auto">
            <button
              type="button"
              onClick={() => handleSelect(activeOrg.id)}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm',
                'bg-muted/60'
              )}
              disabled
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground">
                  {activeOrg.name}
                </span>
                <span className="block text-[11px] capitalize text-muted-foreground">
                  {activeOrg.role}
                </span>
              </span>
              <Check className="h-4 w-4 shrink-0 text-foreground" />
            </button>
            {others.length === 0 ? (
              <p className="px-2 py-2 text-xs text-muted-foreground">
                {t('sidebar.noOtherOrganizations') || 'No other organizations'}
              </p>
            ) : (
              others.map((org) => {
                const isPending = pendingId === org.id
                return (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => handleSelect(org.id)}
                    disabled={switching}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors',
                      'hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60'
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-foreground">
                        {org.name}
                      </span>
                      <span className="block text-[11px] capitalize text-muted-foreground">
                        {org.role}
                      </span>
                    </span>
                    {isPending ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                    ) : null}
                  </button>
                )
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
