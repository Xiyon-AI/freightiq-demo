'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  AudioLines,
  BookOpen,
  SlidersHorizontal,
  Ticket,
  Database,
  Activity,
  Users,
  UploadCloud,
  Search,
  Table2,
  Wrench,
  Cpu,
  Settings2,
  Mic,
  Mail,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n/LanguageContext'

type SectionMeta = {
  id: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  titleKey: string
}

const SECTIONS: SectionMeta[] = [
  { id: 'knowledge-base', icon: BookOpen, titleKey: 'guides.kb.title' },
  { id: 'configuration', icon: SlidersHorizontal, titleKey: 'guides.config.title' },
  { id: 'tickets', icon: Ticket, titleKey: 'guides.tickets.title' },
  { id: 'customers', icon: Database, titleKey: 'guides.customers.title' },
  { id: 'operations', icon: Activity, titleKey: 'guides.operations.title' },
  { id: 'account', icon: Users, titleKey: 'guides.account.title' },
]

const WAVEFORM_BARS = [14, 26, 38, 20, 34, 18, 28]

/* --- small presentational helpers --------------------------------------- */

function Lead({ children }: { children: React.ReactNode }) {
  return <p className="text-base leading-relaxed text-muted-foreground">{children}</p>
}

function SubHeading({ icon: Icon, children }: { icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
      {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
      {children}
    </h3>
  )
}

/** Splits "LABEL: description" so the label reads as a definition term. */
function DefItem({ text }: { text: string }) {
  const idx = text.indexOf(':')
  return (
    <li className="flex gap-3">
      <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
      <p className="text-sm leading-relaxed text-muted-foreground">
        {idx === -1 ? (
          text
        ) : (
          <>
            <span className="font-semibold text-foreground">{text.slice(0, idx)}</span>
            {text.slice(idx)}
          </>
        )}
      </p>
    </li>
  )
}

function Callout({
  icon: Icon,
  tone = 'primary',
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  tone?: 'primary' | 'warning'
  title?: string
  children: React.ReactNode
}) {
  const tones = {
    primary: 'border-primary/15 bg-primary/5 [&_.callout-icon]:bg-primary/10 [&_.callout-icon]:text-primary',
    warning: 'border-warning/30 bg-warning-light [&_.callout-icon]:bg-warning/20 [&_.callout-icon]:text-foreground',
  }
  return (
    <div className={cn('flex gap-4 rounded-2xl border p-5', tones[tone])}>
      <div className="callout-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="space-y-2">
        {title ? <p className="text-sm font-semibold text-foreground">{title}</p> : null}
        <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
      </div>
    </div>
  )
}

function Section({
  meta,
  index,
  children,
}: {
  meta: SectionMeta
  index: number
  children: React.ReactNode
}) {
  const { t } = useLanguage()
  const Icon = meta.icon
  return (
    <motion.section
      id={meta.id}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="scroll-mt-24"
    >
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </div>
        <div>
          <div className="font-mono text-xs font-medium tracking-widest text-muted-foreground">
            {String(index + 1).padStart(2, '0')}
            <span className="text-muted-foreground/40"> / {String(SECTIONS.length).padStart(2, '0')}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{t(meta.titleKey)}</h2>
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </motion.section>
  )
}

/* --- page --------------------------------------------------------------- */

export default function GuidesPage() {
  const { t } = useLanguage()
  const [activeId, setActiveId] = useState<string>(SECTIONS[0]?.id ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const handleNav = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveId(id)
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8 pb-24 md:px-10 md:py-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 h-52 w-52 rounded-full bg-accent/10 blur-3xl" />
        </div>

        {/* animated voice waveform — theme accent */}
        <div
          aria-hidden
          className="absolute right-12 top-1/2 hidden -translate-y-1/2 items-center gap-1.5 lg:flex"
        >
          {WAVEFORM_BARS.map((h, i) => (
            <motion.span
              key={i}
              className="w-1.5 rounded-full bg-primary/40"
              initial={{ height: h }}
              animate={{ height: [h, h * 1.9, h] }}
              transition={{ duration: 1.1 + i * 0.14, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="relative px-6 py-12 md:px-12 md:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground backdrop-blur">
            <AudioLines className="h-3.5 w-3.5 text-primary" />
            {t('guides.badge')}
          </span>
          <h1 className="mt-5 max-w-2xl text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            {t('guides.hero.title')}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {t('guides.hero.subtitle')}
          </p>
        </div>
      </div>

      {/* Mobile table of contents */}
      <nav className="mt-8 rounded-2xl border border-border bg-card p-5 lg:hidden">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t('guides.toc.title')}
        </p>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {SECTIONS.map((s) => {
            const Icon = s.icon
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => handleNav(e, s.id)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4 w-4 text-primary" />
                {t(s.titleKey)}
              </a>
            )
          })}
        </div>
      </nav>

      {/* Content + sticky TOC */}
      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0 space-y-20">
          {/* 1 — Knowledge Base */}
          <Section meta={SECTIONS[0]!} index={0}>
            <div className="space-y-3">
              <SubHeading>{t('guides.kb.objective.title')}</SubHeading>
              <Lead>{t('guides.kb.objective.desc')}</Lead>
            </div>

            <div className="space-y-3">
              <SubHeading icon={UploadCloud}>{t('guides.kb.upload.title')}</SubHeading>
              <Lead>{t('guides.kb.upload.desc')}</Lead>
              <ul className="space-y-2.5">
                <DefItem text={t('guides.kb.upload.method')} />
                <DefItem text={t('guides.kb.upload.formats')} />
                <DefItem text={t('guides.kb.upload.limit')} />
              </ul>
            </div>

            <div className="space-y-3">
              <SubHeading icon={Search}>{t('guides.kb.search.title')}</SubHeading>
              <Lead>{t('guides.kb.search.desc')}</Lead>
            </div>

            <div className="space-y-3">
              <SubHeading icon={Table2}>{t('guides.kb.table.title')}</SubHeading>
              <Lead>{t('guides.kb.table.desc')}</Lead>
              <div className="rounded-2xl border border-border bg-muted/30 p-5">
                <ul className="space-y-2.5">
                  <DefItem text={t('guides.kb.table.name')} />
                  <DefItem text={t('guides.kb.table.status')} />
                  <DefItem text={t('guides.kb.table.pages')} />
                  <DefItem text={t('guides.kb.table.chunks')} />
                  <DefItem text={t('guides.kb.table.created')} />
                  <DefItem text={t('guides.kb.table.actions')} />
                </ul>
              </div>
            </div>
          </Section>

          {/* 2 — Configuration */}
          <Section meta={SECTIONS[1]!} index={1}>
            <div className="space-y-3">
              <SubHeading>{t('guides.config.objective.title')}</SubHeading>
              <Lead>{t('guides.config.objective.desc')}</Lead>
            </div>

            <div className="space-y-3">
              <SubHeading icon={Settings2}>{t('guides.config.nav.title')}</SubHeading>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {[
                  { t: 'guides.config.nav.level.title', d: 'guides.config.nav.level.desc' },
                  { t: 'guides.config.nav.presets.title', d: 'guides.config.nav.presets.desc' },
                  { t: 'guides.config.nav.params.title', d: 'guides.config.nav.params.desc' },
                ].map((c) => (
                  <div
                    key={c.t}
                    className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
                  >
                    <p className="mb-1.5 text-sm font-semibold text-foreground">{t(c.t)}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{t(c.d)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <SubHeading icon={Wrench}>{t('guides.config.params.title')}</SubHeading>

              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm font-semibold text-foreground">{t('guides.config.params.details')}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t('guides.config.params.details.desc')}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Wrench className="h-4 w-4 text-primary" />
                  {t('guides.config.params.tools')}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t('guides.config.params.tools.desc')}
                </p>
                <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {[
                    'guides.config.params.tools.ticket',
                    'guides.config.params.tools.end',
                    'guides.config.params.tools.list',
                    'guides.config.params.tools.lookup',
                    'guides.config.params.tools.search',
                    'guides.config.params.tools.submit',
                  ].map((k) => {
                    const text = t(k)
                    const idx = text.indexOf(':')
                    return (
                      <li
                        key={k}
                        className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground"
                      >
                        {idx === -1 ? (
                          text
                        ) : (
                          <>
                            <code className="font-mono font-semibold text-primary">{text.slice(0, idx)}</code>
                            {text.slice(idx)}
                          </>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Cpu className="h-4 w-4 text-primary" />
                  {t('guides.config.params.model')}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t('guides.config.params.model.desc')}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm font-semibold text-foreground">{t('guides.config.params.behavior')}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t('guides.config.params.behavior.desc')}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Mic className="h-4 w-4 text-primary" />
                  {t('guides.config.params.recording')}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t('guides.config.params.recording.desc')}
                </p>
              </div>
            </div>
          </Section>

          {/* 3 — Tickets */}
          <Section meta={SECTIONS[2]!} index={2}>
            <div className="space-y-3">
              <SubHeading>{t('guides.tickets.objective.title')}</SubHeading>
              <Lead>{t('guides.tickets.objective.desc')}</Lead>
            </div>

            <div className="space-y-3">
              <SubHeading>{t('guides.tickets.ui.title')}</SubHeading>
              <Lead>{t('guides.tickets.ui.desc')}</Lead>
            </div>

            <Callout icon={Mail} title={t('guides.tickets.automation.title')}>
              <p className="mb-3">{t('guides.tickets.automation.desc')}</p>
              <ul className="space-y-2.5">
                <DefItem text={t('guides.tickets.automation.enable')} />
                <DefItem text={t('guides.tickets.automation.email')} />
                <DefItem text={t('guides.tickets.automation.active')} />
              </ul>
            </Callout>

            <div className="space-y-3">
              <SubHeading>{t('guides.tickets.detail.title')}</SubHeading>
              <Lead>{t('guides.tickets.detail.desc')}</Lead>
              <ul className="space-y-2.5">
                <DefItem text={t('guides.tickets.detail.notifications')} />
                <DefItem text={t('guides.tickets.detail.metadata')} />
                <DefItem text={t('guides.tickets.detail.message')} />
                <DefItem text={t('guides.tickets.detail.params')} />
              </ul>
            </div>
          </Section>

          {/* 4 — Customers */}
          <Section meta={SECTIONS[3]!} index={3}>
            <Lead>{t('guides.customers.desc')}</Lead>
            <div className="space-y-3">
              <SubHeading>{t('guides.customers.mapping.title')}</SubHeading>
              <Lead>{t('guides.customers.mapping.desc')}</Lead>
            </div>
            <Callout icon={AlertTriangle} tone="warning">
              {t('guides.customers.mapping.critical')}
            </Callout>
          </Section>

          {/* 5 — Operations */}
          <Section meta={SECTIONS[4]!} index={4}>
            <Lead>{t('guides.operations.desc')}</Lead>
            <ul className="space-y-2.5">
              <DefItem text={t('guides.operations.sessions')} />
              <DefItem text={t('guides.operations.feed')} />
              <DefItem text={t('guides.operations.success')} />
            </ul>
          </Section>

          {/* 6 — Account */}
          <Section meta={SECTIONS[5]!} index={5}>
            <Lead>{t('guides.account.desc')}</Lead>
            <ul className="space-y-2.5">
              <DefItem text={t('guides.account.orgs')} />
              <DefItem text={t('guides.account.invites')} />
            </ul>
          </Section>

          {/* Next steps */}
          <div className="rounded-3xl border border-border bg-muted/30 p-6 md:p-8">
            <h2 className="text-xl font-bold tracking-tight text-foreground">{t('guides.next.title')}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {t('guides.next.desc')}
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3">
              <Link
                href="/operations"
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{t('guides.next.operations')}</p>
                  <p className="truncate text-xs text-muted-foreground">{t('guides.next.operations.desc')}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            </div>
          </div>
        </div>

        {/* Sticky "on this page" rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-3">
            <p className="px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('guides.toc.title')}
            </p>
            <nav className="space-y-0.5">
              {SECTIONS.map((s) => {
                const active = activeId === s.id
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={(e) => handleNav(e, s.id)}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      active
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full transition-colors',
                        active ? 'bg-primary' : 'bg-muted-foreground/30 group-hover:bg-muted-foreground'
                      )}
                    />
                    {t(s.titleKey)}
                  </a>
                )
              })}
            </nav>
          </div>
        </aside>
      </div>
    </div>
  )
}
