'use client'

import { useState, useCallback } from 'react'
import {
  Search, ArrowUpDown, ChevronLeft, ChevronRight,
  Database, Settings2, AlertCircle, RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useActiveOrg } from '@/components/providers/OrgProvider'
import { ConnectionDrawer } from '@/components/customers/connection-drawer'
import { FieldMappingEditor } from '@/components/customers/field-mapping-editor'
import type { ExternalDbConnectionMasked } from '@/lib/types/customer-db'

type PageState = 'loading' | 'no-connection' | 'no-mappings' | 'data'

interface ColumnMeta {
  key: string
  source: string
  is_mandatory: boolean
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

// ─── Derive page state from query results ─────────────────────────────────

function derivePageState(
  connection: ExternalDbConnectionMasked | null | undefined,
  hasMappings: boolean | undefined,
  connLoading: boolean,
  mappingsLoading: boolean,
): PageState {
  if (connLoading || mappingsLoading) return 'loading'
  if (!connection) return 'no-connection'
  if (!hasMappings) return 'no-mappings'
  return 'data'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const { t } = useLanguage()
  const { activeOrg } = useActiveOrg()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(25)
  const [searchQuery, setSearchQuery] = useState('')
  // Allow user to override into 'no-mappings' state to show the editor
  const [forceEditMappings, setForceEditMappings] = useState(false)

  const orgId = activeOrg?.id
  const connection: ExternalDbConnectionMasked | null = getDemoConnection()
  const derivedState = derivePageState(connection, false, false, false)
  // Allow the editor override unless connection is actually missing
  const pageState: PageState = forceEditMappings ? 'no-mappings' : derivedState

  const rows: Record<string, unknown>[] = []
  const columns: ColumnMeta[] = []
  const total = 0
  const dataLoading = false
  const dataFetching = false
  const dataError = null
  const isRevalidating = false

  // ── Callbacks ───────────────────────────────────────────────────────────

  const handleConnectionSaved = useCallback(async () => { setForceEditMappings(false) }, [])

  const handleConnectionDeleted = useCallback(() => {
    setForceEditMappings(false)
  }, [])

  const handleMappingsSaved = useCallback(() => {
    setForceEditMappings(false)
  }, [])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  const handleRefresh = useCallback(() => {}, [])

  const totalPages = Math.ceil(total / pageSize)

  // ── Render: org loading ─────────────────────────────────────────────────

  if (!activeOrg) {
    return (
      <div className="flex-1 w-full p-4 lg:p-8">
        <div className="max-w-[1600px] mx-auto text-center py-20">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground">{t('customerDb.noOrg')}</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full p-4 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* Stale-data shimmer overlay */}
        {isRevalidating && (
          <div className="fixed top-16 left-0 md:left-64 right-0 h-0.5 z-40 overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent animate-shimmer" />
          </div>
        )}

        {/* Connection Drawer */}
        <ConnectionDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          organizationId={orgId!}
          connection={connection ?? null}
          onSaved={handleConnectionSaved}
          onDeleted={handleConnectionDeleted}
        />

        {/* State: Loading */}
        {pageState === 'loading' && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
          </div>
        )}

        {/* State: No Connection */}
        {pageState === 'no-connection' && (
          <div className="flex flex-col items-center justify-center py-24 px-6">
            <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-6">
              <Database className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight mb-2">
              {t('customerDb.noConnectionTitle')}
            </h2>
            <p className="text-[14px] text-gray-500 text-center max-w-md mb-8">
              {t('customerDb.noConnectionDesc')}
            </p>
            <Button
              onClick={() => setDrawerOpen(true)}
              className="bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-[13px] h-11 px-6 shadow-md hover:shadow-lg transition-all"
            >
              <Database className="w-4 h-4 mr-2" />
              {t('customerDb.connectDatabase')}
            </Button>
          </div>
        )}

        {/* State: No Mappings */}
        {pageState === 'no-mappings' && connection && (
          <FieldMappingEditor
            organizationId={orgId!}
            connectionId={connection.id}
            onMappingsSaved={handleMappingsSaved}
          />
        )}

        {/* State: Data Table */}
        {pageState === 'data' && (
          <>
            {/* Search bar */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mb-4">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-gray-400 absolute left-4" strokeWidth={2.5} />
                <input
                  type="text"
                  placeholder={t('customers.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-11 pr-4 py-3 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 w-full sm:w-[320px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] transition-all placeholder:text-gray-400 font-semibold text-foreground"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={dataFetching}
                className="rounded-xl font-bold text-[13px] h-10 border-border/80"
              >
                <RefreshCw className={`w-4 h-4 mr-1.5 ${dataFetching ? 'animate-spin' : ''}`} />
                {t('customerDb.refresh')}
              </Button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto sm:ml-auto">
                <div className="px-4 py-2 bg-muted/30 border border-border/60 rounded-xl">
                  <p className="text-sm font-bold text-neutral-700 dark:text-white">
                    {total} {t('customerDb.customersFound')}
                  </p>
                </div>

                {connection && (
                  <Button
                    variant="outline"
                    onClick={() => setForceEditMappings(true)}
                    className="rounded-xl font-bold text-[13px] h-10 border-border/80"
                  >
                    <Settings2 className="w-4 h-4 mr-2" />
                    {t('customerDb.editMappings')}
                  </Button>
                )}

                <Button
                  onClick={() => setDrawerOpen(true)}
                  className="bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-[13px] h-10 px-5 shadow-md hover:shadow-lg transition-all"
                >
                  <Database className="w-4 h-4 mr-2" />
                  {connection ? t('customerDb.editConnection') : t('customerDb.connectDatabase')}
                </Button>
              </div>
            </div>

            {/* Error state */}
            {dataError && (
              <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200/60 text-center">
                <AlertCircle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                <p className="text-[14px] font-semibold text-rose-800">{(dataError as Error).message}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="mt-3 rounded-xl font-bold text-[13px]"
                >
                  {t('customerDb.retry')}
                </Button>
              </div>
            )}

            {/* Data table */}
            {!dataError && (
              <div className="overflow-x-auto pb-4">
                <table className="w-full text-left border-collapse min-w-[700px]" style={{ borderSpacing: '0 10px', borderCollapse: 'separate' }}>
                  <thead>
                    <tr>
                      {columns.map((col) => (
                        <SortableHeader key={col.key} label={col.key} />
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataLoading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <tr key={`skel-${i}`}>
                          {columns.map((col, ci) => (
                            <td
                              key={col.key}
                              className={`py-4 px-4 bg-card shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border border-border/50/80 ${
                                ci === 0 ? 'rounded-l-[1.5rem] border-r-0' :
                                ci === columns.length - 1 ? 'rounded-r-[1.5rem] border-l-0' : 'border-x-0'
                              }`}
                            >
                              <Skeleton className="h-4 w-24" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : rows.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length} className="py-16 text-center">
                          <p className="text-[14px] font-semibold text-gray-400">
                            {searchQuery ? t('customerDb.noSearchResults') : t('customerDb.noData')}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      rows.map((row, ri) => (
                        <tr key={ri} className="group hover:-translate-y-[1px] transition-all duration-200">
                          {columns.map((col, ci) => (
                            <td
                              key={col.key}
                              className={`py-4 px-4 bg-card shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-border/50/80 hover:border-border transition-all duration-200 text-[13px] font-semibold text-gray-700 dark:text-white ${
                                ci === 0 ? 'rounded-l-[1.5rem] border-r-0' :
                                ci === columns.length - 1 ? 'rounded-r-[1.5rem] border-l-0' : 'border-x-0'
                              }`}
                            >
                              <span className="truncate block max-w-[250px]">
                                {row[col.key] != null ? String(row[col.key]) : '—'}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!dataError && totalPages > 0 && (
              <div className="flex items-center justify-between mt-6 px-2 py-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-gray-600 dark:text-gray-400">
                    {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border/80 rounded-xl text-[13px] font-semibold text-gray-600 dark:text-gray-400 hover:bg-muted/30 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    {t('customers.previous')}
                  </button>
                  <span className="text-[13px] font-bold text-gray-700 dark:text-white px-3">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border/80 rounded-xl text-[13px] font-semibold text-gray-600 dark:text-gray-400 hover:bg-muted/30 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('customers.next')}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function getDemoConnection(): ExternalDbConnectionMasked | null {
  return null
}

function SortableHeader({ label }: { label: string }) {
  return (
    <th className="py-4 px-4 font-bold text-[12px] text-gray-500 dark:text-gray-400 select-none">
      <div className="flex items-center gap-1.5 cursor-pointer group hover:text-foreground transition-colors tracking-wide">
        {label}
        <ArrowUpDown className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors" strokeWidth={3} />
      </div>
    </th>
  )
}
