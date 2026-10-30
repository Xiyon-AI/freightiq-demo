'use client'

import { useState } from 'react'
import { BadgeCheck, Check, FileDown, FileText, Settings2, ShieldCheck, Truck } from 'lucide-react'

const sections = [
  { id: 'workflow', label: 'Workflow', icon: Settings2 },
  { id: 'validation', label: 'Validation', icon: ShieldCheck },
  { id: 'export', label: 'CSV export', icon: FileDown },
  { id: 'tms', label: 'Mock TMS', icon: Truck },
] as const

type SectionId = (typeof sections)[number]['id']

const validationRules = [
  'Required carrier, load, lane, date, and rate fields are present',
  'Pickup date is before delivery date',
  'Linehaul and fuel surcharge match the total rate',
  'Currency is supported by the demo schema',
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('workflow')

  return (
    <div className="w-full p-4 lg:p-8">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground"><Settings2 className="h-4 w-4" /> Workspace configuration</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review the rate confirmation workflow and demo handoff settings.</p>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          <nav aria-label="Settings sections" className="flex w-full flex-shrink-0 gap-2 overflow-x-auto pb-4 [scrollbar-width:none] md:w-64 md:flex-col md:gap-1 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                aria-current={activeSection === id ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors ${activeSection === id ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
              >
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </nav>

          <div className="min-w-0 flex-1 pb-20">
            {activeSection === 'workflow' && (
              <section className="space-y-6">
                <div><h2 className="text-xl font-bold tracking-tight">Rate confirmation workflow</h2><p className="mt-1 text-sm text-muted-foreground">The first FreightIQ demo is set up for carrier rate confirmation PDFs.</p></div>
                <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] md:p-8">
                  <div className="flex items-start gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileText className="h-5 w-5" /></span><div><h3 className="text-sm font-semibold">Document type</h3><p className="mt-1 text-sm text-muted-foreground">Rate confirmation</p><p className="mt-3 text-xs leading-relaxed text-muted-foreground">PDF upload and a sample document are available. The included sample demonstrates structured fields and broker review; uploaded files are previewed locally without a connected extraction service.</p></div></div>
                  <div className="mt-6 grid gap-3 border-t border-border/70 pt-5 sm:grid-cols-2"><SettingFact label="Input format" value="PDF · up to 50 MB"/><SettingFact label="Review mode" value="Human review required"/><SettingFact label="Data storage" value="No database · local demo"/><SettingFact label="Authentication" value="Not required"/></div>
                </div>
              </section>
            )}

            {activeSection === 'validation' && (
              <section className="space-y-6">
                <div><h2 className="text-xl font-bold tracking-tight">Validation rules</h2><p className="mt-1 text-sm text-muted-foreground">Checks shown before a broker approves a rate confirmation.</p></div>
                <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] md:p-8"><div className="mb-5 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck className="h-5 w-5" /></span><div><h3 className="text-sm font-semibold">Broker review checks</h3><p className="text-xs text-muted-foreground">Applied to the included sample record</p></div></div><div className="space-y-4">{validationRules.map((rule) => <p key={rule} className="flex items-start gap-3 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{rule}</p>)}</div></div>
              </section>
            )}

            {activeSection === 'export' && (
              <section className="space-y-6">
                <div><h2 className="text-xl font-bold tracking-tight">CSV export</h2><p className="mt-1 text-sm text-muted-foreground">Structured output for approved rate confirmations.</p></div>
                <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] md:p-8"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><FileDown className="h-5 w-5" /></span><div><h3 className="text-sm font-semibold">Rate confirmation schema</h3><p className="text-xs text-muted-foreground">One approved record per row</p></div></div><div className="mt-5 overflow-x-auto rounded-xl bg-muted/40 p-4 font-mono text-xs leading-relaxed text-muted-foreground">confirmation_number,carrier_name,load_number,origin,destination,pickup_date,delivery_date,linehaul_rate,fuel_surcharge,total_rate,currency</div><p className="mt-4 text-xs text-muted-foreground">Dates use YYYY-MM-DD. CSV downloads are generated in the browser from the reviewed sample data.</p></div>
              </section>
            )}

            {activeSection === 'tms' && (
              <section className="space-y-6">
                <div><h2 className="text-xl font-bold tracking-tight">Mock TMS</h2><p className="mt-1 text-sm text-muted-foreground">A simulated handoff for the first demo.</p></div>
                <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] md:p-8"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Truck className="h-5 w-5" /></span><div><h3 className="text-sm font-semibold">Demo connector</h3><p className="text-xs text-muted-foreground">No external TMS connection</p></div></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Available</span></div><div className="mt-6 flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-4"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><p className="text-xs leading-relaxed text-muted-foreground">Approved sample data can be sent to the mock TMS to demonstrate the handoff response. Real TMS integration is planned for a later phase.</p></div></div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingFact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border/70 bg-muted/10 px-4 py-3"><p className="text-[11px] font-medium text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>
}
