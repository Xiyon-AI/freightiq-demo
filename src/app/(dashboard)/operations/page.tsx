'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Server, Globe, Database, ArrowUpRight,
  Shield, CheckCircle2, AlertCircle, AlertTriangle, X, 
  Terminal, ServerCrash, Clock, User
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useLanguage } from '@/lib/i18n/LanguageContext'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type EventType = 'info' | 'warning' | 'error' | 'success'

interface LiveEvent {
  id: string
  timestamp: string
  type: EventType
  userId: string
  status: string
  payload: any
}

const MOCK_PAYLOADS = [
  { region: "us-east-1", duration: "120ms", path: "/api/v1/auth", _meta: { host: "ip-10-0-1-55", requestId: "req_xyz" } },
  { region: "eu-west-1", error: "Database timeout", code: 504, _meta: { service: "db-cluster" } },
  { userAgent: "Mozilla/5.0", action: "User Login", success: true, _meta: { authMethod: "jwt", platform: "web" } },
  { cpuUsage: "95%", threshold: "80%", message: "High CPU detected on worker node" },
  { ticketId: "TCK-8921", status: "open", priority: "high", _meta: { queue: "billing" } }
]

const DEMO_EVENTS: LiveEvent[] = MOCK_PAYLOADS.map((payload, index) => ({
  id: `evt_demo_00${index + 1}`,
  timestamp: `2026-10-30T08:0${index}:00.000Z`,
  type: (['info', 'error', 'success', 'warning', 'info'] as EventType[])[index]!,
  userId: ['USR-9021', 'SYS-CORE', 'CLI-A8B9', 'USR-0045', 'ANO-1192'][index]!,
  status: ['Processing', 'Timeout', 'Completed', 'Retrying', 'Queued'][index]!,
  payload,
}))

export default function LiveOperationsDashboard() {
  const [events] = useState<LiveEvent[]>(DEMO_EVENTS)
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null)
  const isLoading = false
  const { t } = useLanguage()

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + date.getMilliseconds().toString().padStart(3, '0')
  }

  return (
    <div className="flex-1 w-full p-4 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Action Bar with Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-muted/30/80 border border-border/60 rounded-xl">
              <p className="text-sm font-bold text-neutral-700">{t('operations.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-background px-4 py-2 border border-border/50 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
             <div className="relative flex h-2.5 w-2.5">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
             </div>
             <span className="text-sm font-medium text-neutral-700">{t('operations.connectingOk')}</span>
          </div>
        </div>

        {/* Top KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Active Sessions */}
          <motion.div whileHover="hover">
            <Card className="relative overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] border-border/60">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-neutral-500 font-medium text-sm">
                    <User className="w-4 h-4 text-primary" />
                    {t('operations.activeSessions')}
                  </div>
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground tracking-tight">1,248</div>
                <div className="mt-2 text-xs font-medium text-success flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  {t('operations.fromLastHour')}
                </div>
                <motion.button 
                  variants={{ hover: { opacity: 1, y: 0 }, initial: { opacity: 0, y: 10 } }}
                  initial="initial"
                  transition={{ duration: 0.2 }}
                  className="mt-4 px-3 py-1.5 bg-muted/30 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-lg border border-border transition-colors shadow-sm"
                >
                  {t('operations.viewDetails')}
                </motion.button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Success Rate */}
          <motion.div 
            whileHover="hover"
            className="group relative bg-background rounded-2xl p-5 border border-border/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-neutral-500 font-medium text-sm">
                <CheckCircle2 className="w-4 h-4 text-success" />
                {t('operations.successRate')}
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-foreground tracking-tight">99.9%</div>
                <div className="mt-2 text-xs font-medium text-neutral-500">{t('operations.trailing24h')}</div>
              </div>
              <div className="flex items-end gap-1 h-8 opacity-70">
                {[40, 60, 45, 80, 50, 90, 85, 95].map((h, i) => (
                  <motion.div 
                    key={i} 
                    className="w-1.5 bg-success rounded-t-sm" 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </div>

            <motion.button 
              variants={{ hover: { opacity: 1, y: 0 }, initial: { opacity: 0, y: 10 } }}
              initial="initial"
              transition={{ duration: 0.2 }}
              className="absolute right-4 bottom-4 px-3 py-1.5 bg-muted/30 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-lg border border-border transition-colors shadow-sm"
            >
              {t('operations.viewDetails')}
            </motion.button>
          </motion.div>

          {/* Avg Latency */}
          <motion.div 
            whileHover="hover"
            className="group relative bg-background rounded-2xl p-5 border border-border/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-neutral-500 font-medium text-sm">
                <Activity className="w-4 h-4 text-warning" />
                {t('operations.avgLatency')}
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground tracking-tight">45<span className="text-lg text-neutral-400 ml-1">ms</span></div>
            <div className="mt-3 w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
               <motion.div 
                 className="bg-warning h-full rounded-full" 
                 initial={{ width: 0 }}
                 animate={{ width: '45%' }}
                 transition={{ duration: 1, type: "spring" }}
               />
            </div>

            <motion.button 
              variants={{ hover: { opacity: 1, y: 0 }, initial: { opacity: 0, y: 10 } }}
              initial="initial"
              transition={{ duration: 0.2 }}
              className="absolute right-4 bottom-4 px-3 py-1.5 bg-muted/30 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-lg border border-border transition-colors shadow-sm"
            >
              {t('operations.histograms')}
            </motion.button>
          </motion.div>

          {/* System Status */}
          <motion.div 
            whileHover="hover"
            className="group relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-5 shadow-[0_8px_30px_-4px_rgba(99,102,241,0.3)] overflow-hidden text-white"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-card/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-card/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 text-white/80 font-medium text-sm">
                  <Globe className="w-4 h-4" />
                  {t('operations.systemStatus')}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold tracking-tight">{t('operations.operational')}</div>
              </div>
              <div className="mt-2 text-xs font-medium text-white/90 flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                {t('operations.allServicesResponding')}
              </div>
            </div>

            <motion.button 
              variants={{ hover: { opacity: 1, y: 0 }, initial: { opacity: 0, y: 10 } }}
              initial="initial"
              transition={{ duration: 0.2 }}
              className="absolute right-4 bottom-4 px-3 py-1.5 bg-card/20 hover:bg-card/30 backdrop-blur-md text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors z-10 shadow-sm"
            >
              {t('operations.statusPage')}
            </motion.button>
          </motion.div>

        </div>

        {/* Main Content Area (Split View 70/30) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6 h-full pb-8">
          
          {/* Left Column (Real-time Feed) - 70% */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Terminal className="w-5 h-5 text-neutral-400" />
                {t('operations.liveFeed')}
              </h2>
              <div className="flex gap-2">
                 {[
                   { key: 'All Events', label: t('operations.allEvents') },
                   { key: 'Errors', label: t('operations.errors') },
                   { key: 'Thresholds', label: t('operations.thresholds') },
                 ].map(filter => (
                   <button key={filter.key} className={cn(
                     "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                     filter.key === 'All Events' ? "bg-accent text-black shadow-[0_2px_8px_rgba(253,224,71,0.5)] border border-transparent" : "bg-background text-neutral-600 border border-border hover:bg-muted/30 shadow-sm"
                   )}>
                     {filter.label}
                   </button>
                 ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] relative h-[600px] flex flex-col overflow-hidden">
              
              {/* Table Header (Desktop only) */}
              <div className="hidden md:grid bg-background/60 backdrop-blur-xl border-b border-border/50 px-5 py-3 grid-cols-12 gap-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider relative z-20 shadow-sm">
                <div className="col-span-3 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {t('operations.timestamp')}</div>
                <div className="col-span-3">{t('operations.eventType')}</div>
                <div className="col-span-3 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {t('operations.clientId')}</div>
                <div className="col-span-3">{t('operations.status')}</div>
              </div>

              {/* Feed Body */}
              <div className="flex-1 overflow-y-auto px-2 pb-4 relative z-10 pt-2">
                <div className="space-y-1">
                  <AnimatePresence initial={false}>
                    {isLoading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <div key={`skeleton-${i}`} className="px-3 py-3 items-center bg-background rounded-xl border border-border/50">
                          {/* Mobile skeleton */}
                          <div className="md:hidden space-y-2 p-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-16 rounded-md" />
                            <div className="flex items-center gap-2">
                              <Skeleton className="w-6 h-6 rounded-md" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                          </div>
                          {/* Desktop skeleton */}
                          <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3"><Skeleton className="h-4 w-20" /></div>
                            <div className="col-span-3"><Skeleton className="h-6 w-16 rounded-md" /></div>
                            <div className="col-span-3 flex items-center gap-2">
                              <Skeleton className="w-6 h-6 rounded-md" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="col-span-3"><Skeleton className="h-4 w-20" /></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      events.map((evt) => (
                        <motion.div
                         key={evt.id}
                         initial={{ opacity: 0, y: -20, scale: 0.98, backgroundColor: 'rgba(243, 244, 246, 1)' }}
                         animate={{ opacity: 1, y: 0, scale: 1, backgroundColor: 'hsl(var(--background))' }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                         onClick={() => setSelectedEvent(evt)}
                         className="px-3 py-3 hover:bg-muted/30/80 cursor-pointer transition-colors border border-transparent hover:border-border/50 rounded-xl group"
                      >
                        {/* Mobile card layout */}
                        <div className="md:hidden space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-neutral-500">
                              {formatTime(evt.timestamp)}
                            </span>
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border",
                              evt.type === 'info' && "bg-info-light text-info border-info/20",
                              evt.type === 'success' && "bg-success-light text-success border-success/20",
                              evt.type === 'warning' && "bg-warning-light text-warning border-warning/20",
                              evt.type === 'error' && "bg-error-light text-error border-error/20"
                            )}>
                              {evt.type === 'info' && <Activity className="w-2.5 h-2.5" />}
                              {evt.type === 'success' && <CheckCircle2 className="w-2.5 h-2.5" />}
                              {evt.type === 'warning' && <AlertTriangle className="w-2.5 h-2.5" />}
                              {evt.type === 'error' && <AlertCircle className="w-2.5 h-2.5" />}
                              {t(`operations.event.${evt.type.toLowerCase()}`)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded bg-neutral-100 flex items-center justify-center text-neutral-500 font-mono text-[9px]">
                                {evt.userId.charAt(0)}
                              </div>
                              <span className="text-xs text-neutral-700 font-medium">{evt.userId}</span>
                            </div>
                            <span className="text-xs text-neutral-600 font-medium">
                              {t(`operations.event.${evt.status.toLowerCase()}`)}
                            </span>
                          </div>
                        </div>

                        {/* Desktop grid layout */}
                        <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                        {/* Timestamp */}
                        <div className="col-span-3 text-[13px] font-mono text-neutral-500">
                          {formatTime(evt.timestamp)}
                        </div>

                        {/* Event Type Badge */}
                        <div className="col-span-3 flex items-center">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border shadow-sm",
                            evt.type === 'info' && "bg-info-light text-info border-info/20",
                            evt.type === 'success' && "bg-success-light text-success border-success/20",
                            evt.type === 'warning' && "bg-warning-light text-warning border-warning/20",
                            evt.type === 'error' && "bg-error-light text-error border-error/20"
                          )}>
                            {evt.type === 'info' && <Activity className="w-3 h-3" />}
                            {evt.type === 'success' && <CheckCircle2 className="w-3 h-3" />}
                            {evt.type === 'warning' && <AlertTriangle className="w-3 h-3" />}
                            {evt.type === 'error' && <AlertCircle className="w-3 h-3" />}
                            {t(`operations.event.${evt.type.toLowerCase()}`)}
                          </span>
                        </div>

                        {/* User/Client ID */}
                        <div className="col-span-3 flex items-center gap-2">
                           <div className="w-6 h-6 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-500 font-mono text-[10px] shadow-sm">
                             {evt.userId.charAt(0)}
                           </div>
                           <span className="text-[13px] text-neutral-700 font-medium">{evt.userId}</span>
                        </div>

                        <div className="col-span-3 flex justify-between items-center pr-2">
                          <span className="text-[13px] text-neutral-600 font-medium">
                            {t(`operations.event.${evt.status.toLowerCase()}`)}
                          </span>
                          <span className="text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowUpRight className="w-4 h-4" />
                          </span>
                        </div>

                        </div>
                      </motion.div>
                    ))
                  )}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column (System Health) - 30% */}
          <div className="lg:col-span-4 space-y-6">
             <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-neutral-400" />
                {t('operations.systemHealth')}
             </h2>

             {/* Service Health Widget */}
             <div className="bg-card rounded-2xl border border-border/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] p-5">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 border-b border-border/50 pb-3">{t('operations.serviceDependencies')}</h3>
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100/50 group-hover:bg-indigo-100/80 transition-colors">
                        <Server className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-[13px] text-foreground">{t('operations.coreApi')}</div>
                        <div className="text-[11px] text-neutral-500 font-medium">{t('operations.stable')}</div>
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded-md text-[11px] font-bold shadow-sm">99.98%</div>
                  </div>

                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50 group-hover:bg-blue-100/80 transition-colors">
                        <Database className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-[13px] text-foreground">{t('operations.database')}</div>
                        <div className="text-[11px] text-gray-500 font-medium">{t('operations.primaryCluster')}</div>
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded-md text-[11px] font-bold shadow-sm">99.99%</div>
                  </div>

                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100/50 group-hover:bg-rose-100/80 transition-colors">
                        <Shield className="w-4 h-4 text-rose-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-[13px] text-foreground">{t('operations.authService')}</div>
                        <div className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {t('operations.degraded')}
                        </div>
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-100/50 rounded-md text-[11px] font-bold shadow-sm">98.45%</div>
                  </div>

                </div>
             </div>

             {/* Traffic by Region Mini-map mock */}
             <div className="bg-card rounded-2xl border border-border/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-border/50 pb-3 flex justify-between items-center">
                  {t('operations.trafficRouting')}
                  <Globe className="w-4 h-4 text-gray-300" />
                </h3>
                <div className="space-y-4">
                   <div className="flex flex-col gap-1.5">
                     <div className="flex justify-between text-[13px] font-medium">
                       <span className="text-gray-700">US East <span className="text-gray-400 font-normal">(N. Virginia)</span></span>
                       <span className="text-foreground font-bold">45%</span>
                     </div>
                     <div className="w-full bg-gray-100/80 rounded-full h-1.5 overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} transition={{ duration: 1, ease: 'easeOut' }} className="bg-blue-500 h-1.5 rounded-full"></motion.div>
                     </div>
                   </div>
                   <div className="flex flex-col gap-1.5">
                     <div className="flex justify-between text-[13px] font-medium">
                       <span className="text-gray-700">EU West <span className="text-gray-400 font-normal">(Ireland)</span></span>
                       <span className="text-foreground font-bold">30%</span>
                     </div>
                     <div className="w-full bg-gray-100/80 rounded-full h-1.5 overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: '30%' }} transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }} className="bg-blue-400 h-1.5 rounded-full"></motion.div>
                     </div>
                   </div>
                   <div className="flex flex-col gap-1.5">
                     <div className="flex justify-between text-[13px] font-medium">
                       <span className="text-gray-700">AP South <span className="text-gray-400 font-normal">(Mumbai)</span></span>
                       <span className="text-foreground font-bold">15%</span>
                     </div>
                     <div className="w-full bg-gray-100/80 rounded-full h-1.5 overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: '15%' }} transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }} className="bg-blue-300 h-1.5 rounded-full"></motion.div>
                     </div>
                   </div>
                </div>
             </div>

             {/* Error Log Snippet */}
             <div className="bg-[#0f172a] rounded-2xl border border-gray-800 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.2)] p-5 text-gray-300">
                <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-3">
                  <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
                    <ServerCrash className="w-4 h-4 text-rose-400" />
                    {t('operations.latestException')}
                  </h3>
                  <span className="text-[10px] bg-card/10 px-2 py-0.5 rounded text-gray-400 font-medium">{t('operations.justNow')}</span>
                </div>
                <div className="bg-[#0b1120] rounded-xl p-3 font-mono text-[11px] leading-relaxed overflow-x-auto text-rose-300/80 shadow-inner">
                  <div className="text-rose-400 font-bold mb-1.5 flex items-center gap-2">
                     <X className="w-3 h-3" /> Error: ER_LOCK_WAIT_TIMEOUT
                  </div>
                  <div className="pl-3 border-l border-rose-500/20 space-y-1 py-1">
                    <div className="text-gray-400">at <span>Query.Sequence._packetToError</span> <span className="text-gray-500">(/node_modules/mysql/...:114:16)</span></div>
                    <div className="text-gray-400">at <span>Query.ErrorPacket</span> <span className="text-gray-500">(/node_modules/mysql/...:94:8)</span></div>
                    <div className="text-gray-400">at <span>Protocol._parsePacket</span> <span className="text-gray-500">(/node_modules/mysql/...:250:23)</span></div>
                  </div>
                </div>
             </div>

          </div>
        </div>

      </div>

      {/* Side Drawer Overlay and Panel */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               transition={{ duration: 0.2 }}
               className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-40" 
               onClick={() => setSelectedEvent(null)} 
            />
            
            <motion.div 
               initial={{ x: '100%', boxShadow: '-20px 0 25px -5px rgba(0, 0, 0, 0)' }} 
               animate={{ x: 0, boxShadow: '-25px 0 50px -12px rgba(0, 0, 0, 0.25)' }} 
               exit={{ x: '100%', boxShadow: '-20px 0 25px -5px rgba(0, 0, 0, 0)' }} 
               transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
               className="fixed right-0 top-0 bottom-0 w-full max-w-[400px] bg-card border-l border-border/60 z-50 flex flex-col shadow-2xl"
            >
               <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-card/80 backdrop-blur-xl">
                 <div>
                   <h2 className="text-lg font-bold text-foreground tracking-tight">{t('operations.eventDetails')}</h2>
                   <p className="text-[11px] text-gray-500 mt-0.5 font-mono bg-gray-100 px-2 py-0.5 rounded-md inline-flex">{selectedEvent.id}</p>
                 </div>
                 <button 
                   onClick={() => setSelectedEvent(null)}
                   className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>

               <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/30/30">
                 
                 {/* Highlights */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-card rounded-xl border border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
                      <div className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1.5"><Clock className="w-3 h-3" /> {t('operations.timestamp')}</div>
                      <div className="font-mono text-[13px] text-foreground font-medium">{formatTime(selectedEvent.timestamp)}</div>
                    </div>
                    <div className="p-4 bg-card rounded-xl border border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
                      <div className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1.5"><Activity className="w-3 h-3" /> {t('operations.type')}</div>
                      <div className="font-bold text-[13px] capitalize flex items-center gap-2 text-foreground">
                        <span className={cn(
                           "w-2 h-2 rounded-full",
                           selectedEvent.type === 'info' && "bg-blue-500",
                           selectedEvent.type === 'success' && "bg-emerald-500",
                           selectedEvent.type === 'warning' && "bg-amber-500",
                           selectedEvent.type === 'error' && "bg-rose-500",
                        )} />
                        {selectedEvent.type}
                      </div>
                    </div>
                    <div className="p-4 bg-card rounded-xl border border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
                      <div className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1.5"><User className="w-3 h-3" /> {t('operations.clientId')}</div>
                      <div className="font-mono text-[13px] text-foreground font-medium">{selectedEvent.userId}</div>
                    </div>
                    <div className="p-4 bg-card rounded-xl border border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
                      <div className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-1.5">{t('operations.status')}</div>
                      <div className="font-bold text-[13px] text-foreground">{t(`operations.event.${selectedEvent.status.toLowerCase()}`)}</div>
                    </div>
                 </div>

                 {/* JSON Payload */}
                 <div>
                   <h3 className="text-[13px] font-bold text-foreground mb-3 flex items-center gap-2">
                     <Terminal className="w-4 h-4 text-gray-400" />
                     {t('operations.eventPayload')}
                   </h3>
                   <div className="bg-[#0f172a] rounded-xl p-5 overflow-x-auto border border-gray-800 shadow-lg">
                     <pre className="text-[12px] text-gray-300 font-mono leading-relaxed">
                       {JSON.stringify(selectedEvent.payload, null, 2)}
                     </pre>
                   </div>
                 </div>

                 {/* Actions */}
                 <div className="pt-6 border-t border-border/60 flex gap-3">
                   <button className="flex-1 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg flex justify-center items-center gap-2">
                     <ArrowUpRight className="w-4 h-4" /> {t('operations.createTicket')}
                   </button>
                   <button className="flex-1 bg-card border border-border/80 text-gray-700 px-4 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-muted/30 transition-colors shadow-sm flex justify-center items-center gap-2">
                     {t('operations.copyJson')}
                   </button>
                 </div>

               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
