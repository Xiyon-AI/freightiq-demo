import { BadgeCheck, CalendarCheck, CircleDollarSign, Code2, FileCheck2, MapPin, ShieldCheck, Truck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rate Confirmation Schema",
  description: "Review the structured fields and validation rules used in the FreightIQ demo",
};

const schema = [
  { key: "confirmation_number", label: "Confirmation number", example: "RC-10482", icon: Code2 },
  { key: "carrier_name", label: "Carrier", example: "Northstar Logistics LLC", icon: Truck },
  { key: "load_number", label: "Load number", example: "LD-572091", icon: FileCheck2 },
  { key: "origin / destination", label: "Lane", example: "Dallas, TX → Atlanta, GA", icon: MapPin },
  { key: "pickup_date / delivery_date", label: "Pickup and delivery", example: "Apr 16 → Apr 18, 2025", icon: CalendarCheck },
  { key: "linehaul / fuel_surcharge / total_rate", label: "Rate breakdown", example: "$2,450 + $325 = $2,775 USD", icon: CircleDollarSign },
];

const rules = [
  { title: "Required fields", description: "Carrier, confirmation number, load number, origin, destination, and total rate must be present." },
  { title: "Date sequence", description: "Pickup date must be on or before the delivery date." },
  { title: "Rate arithmetic", description: "Linehaul and fuel surcharge must add up to the total rate." },
  { title: "Broker approval", description: "A broker reviews flagged values before CSV export or mock TMS handoff." },
];

export default function KnowledgePage() {
  return (
    <div className="min-h-full p-4 lg:p-8"><div className="mx-auto max-w-[1300px] space-y-7">
      <div><div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground"><Code2 className="h-4 w-4"/>Demo reference</div><h1 className="text-2xl font-bold tracking-tight">Rate confirmation schema</h1><p className="mt-1 max-w-3xl text-sm text-muted-foreground">The first FreightIQ demo focuses on turning carrier rate confirmation PDFs into a consistent broker-ready record.</p></div>

      <section className="rounded-2xl border border-border bg-card shadow-sm"><div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="text-sm font-semibold">Structured fields</h2><p className="mt-1 text-xs text-muted-foreground">Example output fields available to CSV export and the mock TMS</p></div><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">Rate confirmation v1</span></div><div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">{schema.map((item) => { const Icon = item.icon; return <article key={item.key} className="bg-card p-5"><div className="flex items-center gap-2 text-primary"><Icon className="h-4 w-4"/><span className="text-xs font-semibold">{item.label}</span></div><p className="mt-3 font-mono text-[11px] text-muted-foreground">{item.key}</p><p className="mt-1 text-sm font-medium">{item.example}</p></article>; })}</div></section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]"><div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600"/><h2 className="text-sm font-semibold">Validation rules</h2></div><p className="mt-1 text-xs text-muted-foreground">Checks shown during broker review</p><div className="mt-4 divide-y divide-border">{rules.map((rule) => <div key={rule.title} className="flex gap-3 py-3"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"/><div><p className="text-xs font-semibold">{rule.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{rule.description}</p></div></div>)}</div></div><div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="text-sm font-semibold">Demo boundaries</h2><p className="mt-2 text-xs leading-relaxed text-muted-foreground">This demo is limited to rate confirmations and a mock TMS handoff. It does not require user accounts, authentication, or a database.</p><div className="mt-4 border-t border-border pt-4"><p className="text-xs font-semibold">Later phase</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Real TMS integration, bills of lading, proof of delivery, and invoices.</p></div></div></section>
    </div></div>
  );
}
