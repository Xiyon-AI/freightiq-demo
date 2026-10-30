'use client'

import { useEffect, useState } from 'react'
import {
  Search, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, X, User, CheckCircle2,
  CircleDashed, Clock, MonitorPlay, AlertCircle, Calendar, ChevronLeft,
  ChevronRight, Phone, Mail, Tag, Trash2, Loader2, Pencil, Check, ChevronDown,
  Zap,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AddTicketSheet } from '@/components/tickets/add-ticket-sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useActiveOrg } from '@/components/providers/OrgProvider'
import type { Ticket, TicketEmailConfig } from '@/lib/types/tickets'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function formatDate(dateStr: string | null, locale: string = 'en'): string {
  if (!dateStr) return '—'
  try {
    const localeStr = locale === 'bn' ? 'bn-BD' : 'en-US'
    return new Date(dateStr).toLocaleDateString(localeStr, {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function getTicketContactEmail(ticket: Ticket): string | null {
  return firstNonEmpty(ticket.contact_info?.email)
}

function getTicketContactPhone(ticket: Ticket): string | null {
  return firstNonEmpty(ticket.contact_info?.phone, ticket.contact_info?.number)
}

function getClientName(ticket: Ticket): string {
  return firstNonEmpty(
    ticket.contact_info?.name,
    ticket.contact_info?.phone,
    ticket.contact_info?.number
  ) || 'Unknown'
}

function firstNonEmpty(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return null
}

type SortField = 'id' | 'title' | 'client' | 'status' | 'priority' | 'created_at'
type SortDir = 'asc' | 'desc'

const DEMO_TICKETS: Ticket[] = [
  { id: 'TCK-1042', ticket_number: '1042', title: 'Unable to access billing dashboard', description: 'The customer sees an error after signing in.', category: 'billing', priority: 'high', status: 'open', source: 'voice_agent', organization_id: 'demo-org', session_id: null, customer_id: null, assigned_to: null, contact_info: { name: 'Jordan Lee', email: 'jordan.lee@example.com', phone: '+1 555 010 2042' }, metadata: {}, tags: ['billing', 'login'], resolution: null, created_at: '2026-10-29T09:15:00.000Z', updated_at: '2026-10-29T09:15:00.000Z', deleted_at: null },
  { id: 'TCK-1039', ticket_number: '1039', title: 'Request to update account details', description: 'Customer asked for help updating their profile.', category: 'support', priority: 'medium', status: 'in_progress', source: 'web', organization_id: 'demo-org', session_id: null, customer_id: null, assigned_to: null, contact_info: { name: 'Sam Rivera', email: 'sam.rivera@example.com' }, metadata: {}, tags: ['account'], resolution: null, created_at: '2026-10-28T14:40:00.000Z', updated_at: '2026-10-28T14:40:00.000Z', deleted_at: null },
  { id: 'TCK-1035', ticket_number: '1035', title: 'Product setup question', description: 'Asked about connecting a new workspace.', category: 'general', priority: 'low', status: 'resolved', source: 'email', organization_id: 'demo-org', session_id: null, customer_id: null, assigned_to: null, contact_info: { name: 'Taylor Kim', email: 'taylor.kim@example.com' }, metadata: {}, tags: ['setup'], resolution: 'Shared the setup guide.', created_at: '2026-10-27T11:05:00.000Z', updated_at: '2026-10-27T11:30:00.000Z', deleted_at: null },
]

// Logical ordering (not alphabetical) so sorting by status/priority is meaningful.
const STATUS_RANK: Record<string, number> = { open: 0, in_progress: 1, resolved: 2, closed: 3 }
const PRIORITY_RANK: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }

function compareTickets(a: Ticket, b: Ticket, field: SortField): number {
  switch (field) {
    case 'id':
      return a.id.localeCompare(b.id)
    case 'title':
      return (a.title ?? '').localeCompare(b.title ?? '')
    case 'client':
      return getClientName(a).localeCompare(getClientName(b))
    case 'status':
      return (STATUS_RANK[a.status ?? 'open'] ?? 99) - (STATUS_RANK[b.status ?? 'open'] ?? 99)
    case 'priority':
      return (PRIORITY_RANK[a.priority ?? 'medium'] ?? 99) - (PRIORITY_RANK[b.priority ?? 'medium'] ?? 99)
    case 'created_at':
      return new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()
  }
}

type TicketEmailSummary = {
  label: string
  tone: 'info' | 'success' | 'warning' | 'error' | 'neutral'
  addressedTo: string | null
  detail: string | null
}

function getTicketEmailSummary(
  ticket: Ticket,
  automationEnabled: boolean,
  t: (key: string) => string,
  locale: string
): TicketEmailSummary {
  const notification = ticket.ticket_email_notification

  if (!notification) {
    return automationEnabled
      ? {
          label: t('tickets.emailStatus.notQueued'),
          tone: 'neutral',
          addressedTo: null,
          detail: t('tickets.emailStatus.notQueuedDesc'),
        }
      : {
          label: t('tickets.emailStatus.automationOff'),
          tone: 'neutral',
          addressedTo: null,
          detail: t('tickets.emailStatus.automationOffDesc'),
        }
  }

  switch (notification.status) {
    case 'sent':
      return {
        label: t('tickets.emailStatus.sent'),
        tone: 'success',
        addressedTo: notification.to_email,
        detail: notification.sent_at
          ? `${t('tickets.emailStatus.sentDesc')} ${formatDate(notification.sent_at, locale)}`
          : t('tickets.emailStatus.delivered'),
      }
    case 'failed':
      return {
        label: t('tickets.emailStatus.failed'),
        tone: 'error',
        addressedTo: notification.to_email,
        detail: notification.last_error || t('tickets.emailStatus.failedDesc'),
      }
    case 'retrying':
      return {
        label: t('tickets.emailStatus.retrying'),
        tone: 'warning',
        addressedTo: notification.to_email,
        detail: notification.last_error || t('tickets.emailStatus.retryingDesc'),
      }
    case 'processing':
      return {
        label: t('tickets.emailStatus.sending'),
        tone: 'info',
        addressedTo: notification.to_email,
        detail: t('tickets.emailStatus.sendingDesc'),
      }
    case 'no_recipient':
      return {
        label: t('tickets.emailStatus.noRecipient'),
        tone: 'warning',
        addressedTo: null,
        detail: t('tickets.emailStatus.noRecipientDesc'),
      }
    default:
      return {
        label: t('tickets.emailStatus.queued'),
        tone: 'info',
        addressedTo: notification.to_email,
        detail: t('tickets.emailStatus.queuedDesc'),
      }
  }
}

export default function TicketsPage() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false)
  const [priorityPopoverOpen, setPriorityPopoverOpen] = useState(false)
  const [openMenuTicketId, setOpenMenuTicketId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingField, setEditingField] = useState<'title' | 'description' | 'resolution' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [ticketEmailEnabled, setTicketEmailEnabled] = useState(false)
  const [ticketEmailAddress, setTicketEmailAddress] = useState('')
  const [isSavingTicketEmailConfig, setIsSavingTicketEmailConfig] = useState(false)
  const [emailAutomationOpen, setEmailAutomationOpen] = useState(false)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const { t, locale } = useLanguage()

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }
  const { activeOrg } = useActiveOrg()
  const isLoading = false
  const isFetching = false
  const tickets: Ticket[] = DEMO_TICKETS
  const ticketEmailConfig: TicketEmailConfig = { enabled: true, to_email: 'support@example.com', fallbackRecipientEmail: 'help@example.com', effectiveRecipientEmail: 'support@example.com' }
  const canManageTicketEmail = activeOrg?.role === 'owner' || activeOrg?.role === 'admin'
  const fallbackRecipientEmail = ticketEmailConfig?.fallbackRecipientEmail ?? null
  const ticketEmailConfigReady = Boolean(activeOrg?.id && ticketEmailConfig)
  const ticketEmailControlsDisabled = !ticketEmailConfigReady || !canManageTicketEmail || isSavingTicketEmailConfig

  useEffect(() => {
    setTicketEmailEnabled(ticketEmailConfig?.enabled ?? false)
    setTicketEmailAddress(ticketEmailConfig?.to_email ?? '')
  }, [activeOrg?.id, ticketEmailConfig])

  const filtered = tickets.filter((ticket) => {
    const name = getClientName(ticket).toLowerCase()
    const matchSearch =
      !searchQuery ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  })

  const sorted = [...filtered].sort((a, b) => {
    const cmp = compareTickets(a, b, sortField)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const selectedTicket = tickets.find((tk) => tk.id === selectedTicketId) ?? null
  const selectedTicketEmailSummary = selectedTicket
    ? getTicketEmailSummary(selectedTicket, ticketEmailConfig?.enabled ?? false, t, locale)
    : null

  const handleSaveTicketEmailConfig = async () => {
    setIsSavingTicketEmailConfig(false)
  }

  const ticketEmailPreviewRecipient = firstNonEmpty(ticketEmailAddress, fallbackRecipientEmail)

  const handleDelete = async () => {
    setIsDeleting(false)
    setDeleteId(null)
  }

  const handleCreated = () => {}

  const handlePatch = async (id: string, updates: Record<string, unknown>) => {
    void id
    void updates
    setIsSaving(false)
    setEditingField(null)
  }

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || !!searchQuery

  return (
    <div className="flex-1 w-full p-4 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Email Automation Modal */}
        <Dialog open={emailAutomationOpen} onOpenChange={setEmailAutomationOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <div className="w-7 h-7 rounded-lg bg-foreground/5 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-foreground" strokeWidth={2.5} />
                </div>
                {t('tickets.automationModalTitle')}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Toggle row */}
              <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-muted/30 border border-border/50">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">{t('tickets.automationEnableLabel')}</p>
                  <p className="text-xs text-neutral-500">{t('tickets.automationEnableDesc')}</p>
                </div>
                <button
                  role="switch"
                  aria-checked={ticketEmailEnabled}
                  onClick={() => !ticketEmailControlsDisabled && setTicketEmailEnabled(!ticketEmailEnabled)}
                  disabled={ticketEmailControlsDisabled}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    ticketEmailEnabled ? 'bg-foreground' : 'bg-neutral-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform ${
                      ticketEmailEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Destination email */}
              <div className="space-y-1.5">
                <label htmlFor="modal-ticket-email" className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                  {t('tickets.automationDestinationEmail')}
                </label>
                <Input
                  id="modal-ticket-email"
                  type="email"
                  value={ticketEmailAddress}
                  onChange={(e) => setTicketEmailAddress(e.target.value)}
                  placeholder={t('tickets.automationEmailPlaceholder')}
                  disabled={ticketEmailControlsDisabled}
                  className="rounded-xl"
                />
              </div>

              {/* Recipient preview */}
              <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-400">{t('tickets.automationActiveRecipient')}</p>
                <p className="mt-1.5 text-sm font-semibold text-foreground">
                  {ticketEmailPreviewRecipient ?? t('tickets.automationNoRecipient')}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  {ticketEmailAddress.trim()
                    ? t('tickets.automationUsingOverride')
                    : fallbackRecipientEmail
                      ? t('tickets.automationUsingFallback')
                      : t('tickets.automationNoFallback')}
                </p>
              </div>

              {!ticketEmailConfigReady && (isLoading || isFetching) && (
                <p className="text-xs text-neutral-400">
                  Loading ticket email settings...
                </p>
              )}

              {ticketEmailConfigReady && !canManageTicketEmail && (
                <p className="text-xs text-neutral-400">
                  {t('tickets.automationAdminOnly')}
                </p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <DialogClose asChild>
                <Button variant="ghost" className="rounded-xl" disabled={isSavingTicketEmailConfig}>{t('tickets.automationCancel')}</Button>
              </DialogClose>
              <Button
                onClick={async () => { await handleSaveTicketEmailConfig(); setEmailAutomationOpen(false) }}
                disabled={ticketEmailControlsDisabled}
                className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isSavingTicketEmailConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : t('tickets.automationSave')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
          {/* Search */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 z-10" strokeWidth={2.5} />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('tickets.searchPlaceholder')}
              className="pl-11 pr-10 py-3 h-auto bg-background border-border/60 rounded-xl text-sm w-full sm:w-[240px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] font-semibold"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 w-5 h-5 flex items-center justify-center rounded-md bg-neutral-100/80 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-3 h-3" strokeWidth={3} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
            <PopoverTrigger asChild>
              <button className={`flex items-center gap-2 px-3.5 py-3 bg-background border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] rounded-xl text-[13px] font-semibold hover:bg-muted/30 transition-colors ${statusFilter !== 'all' ? 'border-accent/60 text-foreground bg-accent-light/20' : 'border-border/60 text-neutral-600'}`}>
                <MonitorPlay className="w-4 h-4 text-neutral-400" strokeWidth={2.5} />
                {statusFilter === 'all' ? 'Status' : statusFilter.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-2" align="start">
              {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s)
                    setStatusPopoverOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-accent-light text-foreground' : 'hover:bg-muted/30 text-neutral-700'}`}
                >
                  {s === 'all' ? 'All Statuses' : s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Priority Filter */}
          <Popover open={priorityPopoverOpen} onOpenChange={setPriorityPopoverOpen}>
            <PopoverTrigger asChild>
              <button className={`flex items-center gap-2 px-3.5 py-3 bg-background border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] rounded-xl text-[13px] font-semibold hover:bg-muted/30 transition-colors ${priorityFilter !== 'all' ? 'border-accent/60 text-foreground bg-accent-light/20' : 'border-border/60 text-neutral-600'}`}>
                <AlertCircle className="w-4 h-4 text-neutral-400" strokeWidth={2.5} />
                {priorityFilter === 'all' ? t('tickets.priority') : priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1)}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2" align="start">
              {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPriorityFilter(p)
                    setPriorityPopoverOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${priorityFilter === p ? 'bg-accent-light text-foreground' : 'hover:bg-muted/30 text-neutral-700'}`}
                >
                  {p === 'all' ? 'All Priorities' : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <button
            onClick={() => handleSort('created_at')}
            className={`flex items-center gap-2 px-3.5 py-3 bg-background border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] rounded-xl text-[13px] font-semibold hover:bg-muted/30 transition-colors ${sortField === 'created_at' ? 'border-accent/60 text-foreground bg-accent-light/20' : 'border-border/60 text-neutral-600'}`}
          >
            <Calendar className="w-4 h-4 text-neutral-400" strokeWidth={2.5} />
            {t('tickets.dateAdded')}
            {sortField === 'created_at' && (
              sortDir === 'asc'
                ? <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.5} />
                : <ArrowDown className="w-3.5 h-3.5" strokeWidth={2.5} />
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setSearchQuery('') }}
              className="flex items-center gap-2 px-3.5 py-3 bg-background border border-border/60 rounded-xl text-[13px] font-semibold text-neutral-500 hover:bg-muted/30 hover:text-neutral-700 transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
              Clear Filters
            </button>
          )}

          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <button
              onClick={() => setEmailAutomationOpen(true)}
              disabled={!ticketEmailConfigReady && (isLoading || isFetching)}
              className={`flex items-center gap-1.5 px-3.5 py-3 bg-background border rounded-xl text-[13px] font-semibold shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:bg-muted/30 transition-colors ${
                ticketEmailEnabled
                  ? 'border-foreground/20 text-foreground'
                  : 'border-border/60 text-neutral-500'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <Zap className={`w-4 h-4 ${ticketEmailEnabled ? 'text-foreground' : 'text-neutral-400'}`} strokeWidth={2.5} />
              {t('tickets.automation')}
            </button>
            <AddTicketSheet onCreated={handleCreated} />
          </div>
        </div>

        {/* Layout Wrapper (Master / Detail) */}
        <div className="flex gap-6 relative items-start min-w-0">

          {/* Left Side: Table (shrinks properly when panel opens) */}
          <div className={`min-w-0 transition-all duration-500 ease-in-out ${selectedTicketId ? 'hidden xl:block xl:w-[63%]' : 'w-full'}`}>

            {/* ═══ MOBILE: Card view (below md) ═══ */}
            <div className="md:hidden space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={`m-skel-${i}`} className="rounded-2xl border border-border bg-background p-4 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-xl" />
                      <Skeleton className="h-6 w-16 rounded-xl" />
                    </div>
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-7 h-7 text-neutral-300" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-400">
                    {tickets.length === 0 ? 'No tickets yet' : 'No tickets match your filters'}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={() => { setSearchQuery(''); setStatusFilter('all'); setPriorityFilter('all') }}
                      className="text-xs text-neutral-500 underline hover:text-neutral-700 transition-colors mt-2"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                sorted.map((ticket) => {
                  const clientName = getClientName(ticket)
                  const initials = getInitials(clientName)
                  const isSelected = selectedTicketId === ticket.id

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`rounded-2xl border p-4 space-y-3 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-accent/50 bg-accent-light/30 shadow-[0_4px_16px_rgba(253,224,71,0.15)]'
                          : 'border-border bg-background hover:border-border hover:shadow-md'
                      }`}
                    >
                      {/* Top row: ID + priority */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-neutral-500">
                          #{ticket.id.slice(0, 8).toUpperCase()}
                        </span>
                        <PriorityBadge priority={ticket.priority || 'medium'} />
                      </div>

                      {/* Title */}
                      <p className="text-sm font-semibold text-foreground line-clamp-2">
                        {ticket.title}
                      </p>

                      {/* Client + Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex-shrink-0 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-neutral-600">{initials}</span>
                          </div>
                          <span className="text-xs font-medium text-neutral-600 truncate">{clientName}</span>
                        </div>
                        <StatusBadge status={ticket.status || 'open'} />
                      </div>

                      {/* Date */}
                      <div className="text-[11px] text-neutral-400 font-medium">
                        {formatDate(ticket.created_at, locale)}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* ═══ DESKTOP: Table view (md+) ═══ */}
            <div className="hidden md:block overflow-x-auto pb-4 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-neutral-400 [&::-webkit-scrollbar-thumb]:transition-colors">
              <table className="w-full text-left border-collapse min-w-[800px]" style={{ borderSpacing: '0 12px', borderCollapse: 'separate' }}>
                <thead>
                  <tr>
                    <th className="py-2 px-4 w-12">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-foreground focus:ring-accent focus:ring-offset-1" />
                    </th>
                    <SortableHeader label={t('tickets.ticketId')} field="id" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortableHeader label={t('tickets.subject')} field="title" sortField={sortField} sortDir={sortDir} onSort={handleSort} className={selectedTicketId ? "hidden sm:table-cell" : "w-[30%]"} />
                    <SortableHeader label={t('tickets.client')} field="client" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortableHeader label={t('common.status')} field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort} className={selectedTicketId ? "hidden lg:table-cell" : "hidden lg:table-cell"} />
                    <SortableHeader label={t('tickets.priority')} field="priority" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortableHeader label={t('tickets.createdAt')} field="created_at" sortField={sortField} sortDir={sortDir} onSort={handleSort} className={selectedTicketId ? "hidden" : "hidden xl:table-cell"} />
                    <th className="py-2 px-4 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={`skeleton-${i}`} className="group transition-all duration-300">
                        <td className="py-4 px-4 rounded-l-[1.5rem] bg-background border border-border/50/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border-r-0">
                          <Skeleton className="w-4 h-4 rounded" />
                        </td>
                        <td className="py-4 px-4 bg-background border border-border/50/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border-x-0">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className={`py-4 px-4 pr-6 bg-background border border-border/50/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border-x-0 ${selectedTicketId ? 'hidden sm:table-cell' : ''}`}>
                          <Skeleton className="h-4 w-full max-w-[180px]" />
                        </td>
                        <td className="py-4 px-4 bg-background border border-border/50/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border-x-0">
                          <div className="flex items-center gap-2.5">
                            <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </td>
                        <td className="py-4 px-4 hidden lg:table-cell bg-background border border-border/50/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border-x-0">
                          <Skeleton className="h-6 w-20 rounded-xl" />
                        </td>
                        <td className="py-4 px-4 bg-background border border-border/50/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border-x-0">
                          <Skeleton className="h-6 w-16 rounded-xl" />
                        </td>
                        <td className={`py-4 px-4 bg-background border border-border/50/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border-x-0 ${selectedTicketId ? 'hidden' : 'hidden xl:table-cell'}`}>
                          <Skeleton className="h-4 w-28" />
                        </td>
                        <td className="py-4 px-4 rounded-r-[1.5rem] text-right bg-background border border-border/50/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border-l-0">
                          <Skeleton className="w-8 h-8 rounded-xl ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center">
                            <Search className="w-7 h-7 text-neutral-300" />
                          </div>
                          <p className="text-sm font-semibold text-neutral-400">
                            {tickets.length === 0 ? 'No tickets yet' : 'No tickets match your filters'}
                          </p>
                          {hasActiveFilters && (
                            <button
                              onClick={() => { setSearchQuery(''); setStatusFilter('all'); setPriorityFilter('all') }}
                              className="text-xs text-neutral-500 underline hover:text-neutral-700 transition-colors"
                            >
                              Clear filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sorted.map((ticket) => {
                      const isSelected = selectedTicketId === ticket.id
                      const clientName = getClientName(ticket)
                      const initials = getInitials(clientName)
                      const bgClass = isSelected ? 'bg-accent-light/50' : 'bg-background hover:bg-background'
                      const shadowClass = isSelected
                        ? 'shadow-[0_8px_30px_rgb(253,224,71,0.15)] border border-accent/50'
                        : 'shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-border/50/80 hover:border-border'
                      const transformClass = isSelected ? 'scale-[1.01] z-10 relative' : 'hover:-translate-y-[2px] z-0'

                      return (
                        <tr
                          key={ticket.id}
                          onClick={() => setSelectedTicketId(ticket.id)}
                          className={`group cursor-pointer transition-all duration-300 ${transformClass}`}
                        >
                          <td className={`py-4 px-4 rounded-l-[1.5rem] ${bgClass} ${shadowClass} border-r-0 transition-all duration-300`}>
                            <div onClick={(e) => e.stopPropagation()}>
                              <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-foreground focus:ring-accent focus:ring-offset-1" />
                            </div>
                          </td>

                          <td className={`py-4 px-4 font-bold text-[13px] text-foreground font-mono ${bgClass} ${shadowClass} border-x-0 transition-all duration-300`}>
                            #{ticket.id.slice(0, 8).toUpperCase()}
                          </td>

                          <td className={`py-4 px-4 text-[13px] font-semibold text-neutral-600 truncate pr-6 ${isSelected ? 'hidden sm:table-cell' : ''} ${bgClass} ${shadowClass} border-x-0 transition-all duration-300 max-w-[180px]`}>
                            {ticket.title}
                          </td>

                          <td className={`py-4 px-4 ${bgClass} ${shadowClass} border-x-0 transition-all duration-300`}>
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex-shrink-0 flex items-center justify-center shadow-sm">
                                <span className="text-[10px] font-bold text-neutral-600">{initials}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="block truncate text-[13px] font-bold text-neutral-700">{clientName}</span>
                              </div>
                            </div>
                          </td>

                          <td className={`py-4 px-4 hidden lg:table-cell ${bgClass} ${shadowClass} border-x-0 transition-all duration-300`}>
                            <StatusBadge status={ticket.status || 'open'} />
                          </td>

                          <td className={`py-4 px-4 ${bgClass} ${shadowClass} border-x-0 transition-all duration-300`}>
                            <PriorityBadge priority={ticket.priority || 'medium'} />
                          </td>

                          <td className={`py-4 px-4 text-[13px] font-semibold text-neutral-500 ${isSelected ? 'hidden' : 'hidden xl:table-cell'} ${bgClass} ${shadowClass} border-x-0 transition-all duration-300`}>
                            {formatDate(ticket.created_at, locale)}
                          </td>

                          <td className={`py-4 px-4 rounded-r-[1.5rem] text-right ${bgClass} ${shadowClass} border-l-0 transition-all duration-300`}>
                            <Popover open={openMenuTicketId === ticket.id} onOpenChange={(open) => setOpenMenuTicketId(open ? ticket.id : null)}>
                              <PopoverTrigger asChild>
                                <button
                                  className="text-neutral-300 hover:text-neutral-700 p-2 rounded-xl hover:bg-neutral-100/50 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="w-5 h-5" strokeWidth={2.5} />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-52 p-2" align="end">
                                <div className="flex flex-col gap-1">
                                  <Button
                                    variant="ghost"
                                    className="justify-start text-sm h-9"
                                    onClick={(e) => { e.stopPropagation(); setSelectedTicketId(ticket.id); setOpenMenuTicketId(null) }}
                                  >
                                    View Details
                                  </Button>
                                  <div className="h-px bg-border/50 my-1" />
                                  <p className="text-[11px] font-bold text-neutral-400 px-2 py-1 uppercase tracking-wide">Set Status</p>
                                  {(['open', 'in_progress', 'resolved', 'closed'] as const).map((s) => (
                                    <Button
                                      key={s}
                                      variant="ghost"
                                      className={`justify-between text-sm h-9 ${ticket.status === s ? 'bg-accent-light' : ''}`}
                                      onClick={(e) => { e.stopPropagation(); handlePatch(ticket.id, { status: s }); setOpenMenuTicketId(null) }}
                                    >
                                      {s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                      {ticket.status === s && <Check className="w-3.5 h-3.5" />}
                                    </Button>
                                  ))}
                                  <div className="h-px bg-border/50 my-1" />
                                  <Button
                                    variant="ghost"
                                    className="justify-start text-sm h-9 text-destructive hover:text-destructive hover:bg-destructive/5"
                                    onClick={(e) => { e.stopPropagation(); setDeleteId(ticket.id); setOpenMenuTicketId(null) }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {t('common.delete')}
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </td>
                        </tr>
                      )
                    })
                  )}</tbody>
              </table>
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="flex items-center justify-between mt-6 px-2 py-4 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-background border border-border/80 rounded-xl px-3 py-2 shadow-sm">
                    <span className="text-[13px] font-semibold text-neutral-700">{filtered.length} Tickets</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button disabled className="flex items-center gap-1.5 px-3 py-2 bg-background border border-border/80 rounded-xl text-[13px] font-semibold text-neutral-600 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    {t('tickets.previous')}
                  </button>
                  <button disabled className="flex items-center gap-1.5 px-3 py-2 bg-background border border-border/80 rounded-xl text-[13px] font-semibold text-neutral-600 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                    {t('tickets.next')}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Preview Panel */}
          {selectedTicketId && selectedTicket && (
            <div className="w-full xl:w-[40%] bg-background border border-border/50/80 rounded-2xl xl:rounded-[2.5rem] p-4 sm:p-6 xl:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sticky top-6 max-h-[calc(100vh-120px)] overflow-y-auto animate-in slide-in-from-right-8 duration-500 fade-in [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-neutral-400 [&::-webkit-scrollbar-thumb]:transition-colors">
              {/* Panel Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6 xl:mb-8 pb-3 sm:pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg xl:text-xl font-bold text-foreground tracking-tight">{t('tickets.ticketPreview')}</h3>
                  {isSaving && <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-neutral-400" />}
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => setDeleteId(selectedTicket.id)}
                    className="p-1.5 sm:p-2 hover:bg-destructive/5 rounded-full transition-colors group"
                    title="Delete ticket"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 group-hover:text-destructive" strokeWidth={2.5} />
                  </button>
                  <button onClick={() => setSelectedTicketId(null)} className="p-1.5 sm:p-2 hover:bg-neutral-100 rounded-full transition-colors">
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 hover:text-neutral-700" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6 xl:space-y-8">
                {/* Clickable Status + Priority badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                        <StatusBadge status={selectedTicket.status || 'open'} />
                        <ChevronDown className="w-3 h-3 text-neutral-400" strokeWidth={3} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" align="start">
                      <p className="text-[11px] font-bold text-neutral-400 px-2 py-1 uppercase tracking-wide mb-1">{t('tickets.changeStatus')}</p>
                      {(['open', 'in_progress', 'resolved', 'closed'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => handlePatch(selectedTicket.id, { status: s })}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedTicket.status === s ? 'bg-accent-light text-foreground' : 'hover:bg-muted/30 text-neutral-700'
                            }`}
                        >
                          {s === 'open' ? t('common.open') : s === 'in_progress' ? t('common.inProgress') : s === 'resolved' ? t('common.resolved') : t('common.closed')}
                          {selectedTicket.status === s && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>

                  {/* Priority Picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                        <PriorityBadge priority={selectedTicket.priority || 'medium'} />
                        <ChevronDown className="w-3 h-3 text-neutral-400" strokeWidth={3} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-44 p-2" align="start">
                      <p className="text-[11px] font-bold text-neutral-400 px-2 py-1 uppercase tracking-wide mb-1">{t('tickets.changePriority')}</p>
                      {(['urgent', 'high', 'medium', 'low'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => handlePatch(selectedTicket.id, { priority: p })}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedTicket.priority === p ? 'bg-accent-light text-foreground' : 'hover:bg-muted/30 text-neutral-700'
                            }`}
                        >
                          {p === 'urgent' ? t('common.urgent') : p === 'high' ? t('common.high') : p === 'medium' ? t('common.medium') : t('common.low')}
                          {selectedTicket.priority === p && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>

                  <span className="text-xs sm:text-sm font-bold text-neutral-400 ml-auto font-mono">
                    #{selectedTicket.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>

                {/* Editable Title */}
                <div className="group">
                  {editingField === 'title' ? (
                    <div className="space-y-2">
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full text-lg sm:text-xl xl:text-2xl font-bold text-foreground leading-snug tracking-tight bg-muted/30 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && editValue.trim()) handlePatch(selectedTicket.id, { title: editValue.trim() })
                          if (e.key === 'Escape') setEditingField(null)
                        }}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="h-8 rounded-xl text-xs" onClick={() => { if (editValue.trim()) handlePatch(selectedTicket.id, { title: editValue.trim() }) }} disabled={isSaving}>
                          <Check className="w-3.5 h-3.5 mr-1.5" />Save
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 rounded-xl text-xs" onClick={() => setEditingField(null)}>{t('common.cancel')}</Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-start gap-2 cursor-pointer"
                      onClick={() => { setEditingField('title'); setEditValue(selectedTicket.title) }}
                    >
                      <h2 className="text-lg sm:text-xl xl:text-2xl font-bold text-foreground leading-snug tracking-tight flex-1">
                        {selectedTicket.title}
                      </h2>
                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-300 group-hover:text-neutral-500 mt-1 sm:mt-1.5 shrink-0 transition-colors" strokeWidth={2.5} />
                    </div>
                  )}
                </div>

                {/* Contact Card */}
                <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-muted/30/50 border border-border/50/60 space-y-3">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 shrink-0 flex items-center justify-center shadow-sm border border-border/50">
                      <span className="text-base sm:text-lg font-bold text-neutral-600">
                        {getInitials(getClientName(selectedTicket))}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground text-sm sm:text-base">{getClientName(selectedTicket)}</p>
                      {getTicketContactEmail(selectedTicket) && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400 shrink-0" />
                          <p className="text-xs sm:text-[13px] font-medium text-neutral-500 truncate">
                            {getTicketContactEmail(selectedTicket)}
                          </p>
                        </div>
                      )}
                      {getTicketContactPhone(selectedTicket) && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400 shrink-0" />
                          <p className="text-xs sm:text-[13px] font-medium text-neutral-500">
                            {getTicketContactPhone(selectedTicket)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedTicketEmailSummary && (
                  <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-muted/30/50 border border-border/50/60 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm sm:text-base font-bold text-foreground tracking-tight">{t('tickets.ticketEmail')}</h4>
                      <TicketEmailStatusBadge summary={selectedTicketEmailSummary} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                      <div>
                        <p className="text-[11px] sm:text-[12px] font-medium text-neutral-400 uppercase tracking-wide">{t('tickets.addressedTo')}</p>
                        <p className="mt-1 text-sm font-semibold text-foreground break-all">
                          {selectedTicketEmailSummary.addressedTo ?? '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] sm:text-[12px] font-medium text-neutral-400 uppercase tracking-wide">{t('tickets.deliveryDetail')}</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {selectedTicketEmailSummary.detail ?? 'No delivery details available.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="p-4 sm:p-5 xl:p-6 rounded-2xl sm:rounded-3xl border border-border/50/60 bg-background shadow-sm">
                  <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:gap-6 text-sm">
                    <div>
                      <div className="flex items-center gap-1 sm:gap-1.5 text-gray-400 font-medium mb-1 sm:mb-1.5">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <p className="text-[11px] sm:text-[12px]">{t('tickets.createdAt')}</p>
                      </div>
                      <p className="font-bold text-foreground text-xs sm:text-[13px]">{formatDate(selectedTicket.created_at, locale)}</p>
                    </div>

                    {/* Category — editable Select */}
                    <div>
                      <div className="flex items-center gap-1 sm:gap-1.5 text-gray-400 font-medium mb-1 sm:mb-1.5">
                        <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <p className="text-[11px] sm:text-[12px]">{t('tickets.category')}</p>
                      </div>
                      <Select
                        value={selectedTicket.category || 'support'}
                        onValueChange={(val) => handlePatch(selectedTicket.id, { category: val })}
                      >
                        <SelectTrigger className="h-auto py-0 px-0 border-0 shadow-none text-xs sm:text-[13px] font-bold bg-transparent focus:ring-0 gap-1.5 w-auto capitalize">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['support', 'billing', 'technical', 'general', 'bug', 'feature_request', 'other'].map((c) => (
                            <SelectItem key={c} value={c} className="text-xs sm:text-[13px] capitalize">
                              {c.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 sm:gap-1.5 text-gray-400 font-medium mb-1 sm:mb-1.5">
                        <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <p className="text-[11px] sm:text-[12px]">{t('tickets.assignee')}</p>
                      </div>
                      <p className="font-bold text-foreground text-xs sm:text-[13px]">{t('tickets.unassigned')}</p>
                    </div>

                    {selectedTicket.session_id && (
                      <div>
                        <div className="flex items-center gap-1 sm:gap-1.5 text-gray-400 font-medium mb-1 sm:mb-1.5">
                          <MonitorPlay className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <p className="text-[11px] sm:text-[12px]">{t('tickets.session')}</p>
                        </div>
                        <p className="font-bold text-foreground text-xs sm:text-[13px] font-mono truncate">
                          {selectedTicket.session_id.slice(0, 12)}…
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <hr className="border-border/50/60" />

                {/* Editable Description */}
                <div className="group">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h4 className="font-bold text-foreground tracking-tight text-sm sm:text-base">{t('tickets.originalMessage')}</h4>
                    {editingField !== 'description' && (
                      <button
                        onClick={() => { setEditingField('description'); setEditValue(selectedTicket.description || '') }}
                        className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-[12px] font-semibold text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={2.5} />
                        Edit
                      </button>
                    )}
                  </div>
                  {editingField === 'description' ? (
                    <div className="space-y-2">
                      <textarea
                        autoFocus
                        className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 border border-border text-neutral-700 text-xs sm:text-sm leading-relaxed font-medium resize-none focus:outline-none focus:ring-2 focus:ring-accent/40 min-h-[100px] sm:min-h-[120px]"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Escape') setEditingField(null) }}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="h-7 sm:h-8 rounded-xl text-xs" onClick={() => handlePatch(selectedTicket.id, { description: editValue })} disabled={isSaving}>
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />Save
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 sm:h-8 rounded-xl text-xs" onClick={() => setEditingField(null)}>{t('common.cancel')}</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 sm:p-4 xl:p-5 rounded-xl sm:rounded-2xl bg-info-light/30 border border-info/20 text-neutral-700 text-xs sm:text-sm leading-relaxed font-medium">
                      {selectedTicket.description ? (
                        <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
                      ) : (
                        <p className="text-neutral-400 italic">{t('tickets.noDescription')}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Resolution — shown for resolved/closed tickets */}
                {(selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') && (
                  <div className="group">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h4 className="font-bold text-foreground tracking-tight text-sm sm:text-base">{t('tickets.resolutionNotes')}</h4>
                      {editingField !== 'resolution' && (
                        <button
                          onClick={() => { setEditingField('resolution'); setEditValue(selectedTicket.resolution || '') }}
                          className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-[12px] font-semibold text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                          <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={2.5} />
                          {t('common.edit')}
                        </button>
                      )}
                    </div>
                    {editingField === 'resolution' ? (
                      <div className="space-y-2">
                        <textarea
                          autoFocus
                          className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 border border-border text-neutral-700 text-xs sm:text-sm leading-relaxed font-medium resize-none focus:outline-none focus:ring-2 focus:ring-accent/40 min-h-[80px] sm:min-h-[100px]"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Escape') setEditingField(null) }}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" className="h-7 sm:h-8 rounded-xl text-xs" onClick={() => handlePatch(selectedTicket.id, { resolution: editValue })} disabled={isSaving}>
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />Save
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 sm:h-8 rounded-xl text-xs" onClick={() => setEditingField(null)}>{t('common.cancel')}</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 sm:p-4 xl:p-5 rounded-xl sm:rounded-2xl bg-success-light/30 border border-success/20 text-neutral-700 text-xs sm:text-sm leading-relaxed font-medium">
                        {selectedTicket.resolution ? (
                          <p className="whitespace-pre-wrap">{selectedTicket.resolution}</p>
                        ) : (
                          <p className="text-neutral-400 italic">{t('tickets.noResolutionNotes')}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('tickets.deleteTicketTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The ticket will be permanently removed from your organization.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function SortableHeader({
  label,
  field,
  sortField,
  sortDir,
  onSort,
  className = "",
}: {
  label: string
  field: SortField
  sortField: SortField
  sortDir: SortDir
  onSort: (field: SortField) => void
  className?: string
}) {
  const isActive = sortField === field
  return (
    <th className={`py-4 px-4 font-bold text-[12px] text-gray-500 select-none ${className}`}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`flex items-center gap-1.5 cursor-pointer group transition-colors tracking-wide hover:text-foreground ${isActive ? 'text-foreground' : ''}`}
      >
        {label}
        {isActive ? (
          sortDir === 'asc'
            ? <ArrowUp className="w-3 h-3 text-foreground transition-colors" strokeWidth={3} />
            : <ArrowDown className="w-3 h-3 text-foreground transition-colors" strokeWidth={3} />
        ) : (
          <ArrowUpDown className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors" strokeWidth={3} />
        )}
      </button>
    </th>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const { t } = useLanguage()
  let className = ''

  if (priority === 'urgent' || priority === 'high') {
    className = 'bg-error-light text-error border-error/20'
  } else if (priority === 'medium') {
    className = 'bg-warning-light text-warning border-warning/20'
  } else {
    className = 'bg-success-light text-success border-success/20'
  }

  const label = priority === 'urgent' ? t('common.urgent') : priority === 'high' ? t('common.high') : priority === 'medium' ? t('common.medium') : t('common.low')

  return (
    <Badge className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm ${className}`}>
      {label}
    </Badge>
  )
}

function TicketEmailStatusBadge({
  summary,
  compact = false,
}: {
  summary: TicketEmailSummary
  compact?: boolean
}) {
  let className = ''
  let icon = null

  if (summary.tone === 'success') {
    className = 'bg-success-light text-success border-success/20'
    icon = <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={3} />
  } else if (summary.tone === 'error') {
    className = 'bg-error-light text-error border-error/20'
    icon = <AlertCircle className="w-3.5 h-3.5" strokeWidth={3} />
  } else if (summary.tone === 'warning') {
    className = 'bg-warning-light text-warning border-warning/20'
    icon = <Clock className="w-3.5 h-3.5" strokeWidth={3} />
  } else if (summary.tone === 'info') {
    className = 'bg-info-light text-info border-info/20'
    icon = <CircleDashed className="w-3.5 h-3.5" strokeWidth={3} />
  } else {
    className = 'bg-neutral-100 text-neutral-500 border-neutral-200'
    icon = <Mail className="w-3.5 h-3.5" strokeWidth={3} />
  }

  return (
    <Badge className={`inline-flex items-center gap-1.5 rounded-xl border font-bold shadow-sm ${compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]'} ${className}`}>
      {icon}
      {summary.label}
    </Badge>
  )
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage()
  let className = ''
  let icon = null

  if (status === 'open') {
    className = 'bg-info-light text-info border-info/20'
    icon = <CircleDashed className="w-3.5 h-3.5" strokeWidth={3} />
  } else if (status === 'in_progress') {
    className = 'bg-warning-light text-warning border-warning/20'
    icon = <Clock className="w-3.5 h-3.5" strokeWidth={3} />
  } else if (status === 'resolved') {
    className = 'bg-success-light text-success border-success/20'
    icon = <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={3} />
  } else {
    className = 'bg-neutral-100 text-neutral-500 border-neutral-200'
    icon = <X className="w-3.5 h-3.5" strokeWidth={3} />
  }

  const labels: Record<string, string> = {
    open: t('common.open'),
    in_progress: t('common.inProgress'),
    resolved: t('common.resolved'),
    closed: t('common.closed'),
  }

  return (
    <Badge className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm ${className}`}>
      {icon}
      {labels[status] ?? status}
    </Badge>
  )
}
