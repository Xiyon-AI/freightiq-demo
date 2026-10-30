import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Send,
  TriangleAlert,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const recentDocuments = [
  { name: "Northstar Logistics · RC-10482.pdf", carrier: "Northstar Logistics", lane: "Dallas, TX → Atlanta, GA", date: "Today, 10:42 AM", status: "Ready to review", tone: "amber" },
  { name: "Harbor Freight · RC-8831.pdf", carrier: "Harbor Freight", lane: "Houston, TX → Memphis, TN", date: "Today, 10:18 AM", status: "Validated", tone: "green" },
  { name: "Summit Transport · RC-33019.pdf", carrier: "Summit Transport", lane: "Chicago, IL → Columbus, OH", date: "Today, 9:56 AM", status: "Needs attention", tone: "rose" },
  { name: "Blue Ridge Cargo · RC-7781.pdf", carrier: "Blue Ridge Cargo", lane: "Savannah, GA → Charlotte, NC", date: "Today, 9:21 AM", status: "Sent to TMS", tone: "blue" },
];

const statusClass: Record<string, string> = {
  amber: "bg-amber-50 text-amber-700",
  green: "bg-emerald-50 text-emerald-700",
  rose: "bg-rose-50 text-rose-700",
  blue: "bg-blue-50 text-blue-700",
};

export default function OperationsPage() {
  return (
    <div className="min-h-full p-4 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground"><Truck className="h-4 w-4"/>FreightIQ broker workspace</div><h1 className="text-2xl font-bold tracking-tight">Operations overview</h1><p className="mt-1 text-sm text-muted-foreground">Rate confirmations, review exceptions, and TMS handoffs in one place.</p></div><Button asChild><Link href="/intake"><FileText className="mr-1.5 h-4 w-4"/>Open intake</Link></Button></div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Broker operations overview">
          <Metric icon={<FileText className="h-4 w-4"/>} label="Rate confirmations today" value="34" foot="8 received this hour" tint="text-primary"/>
          <Metric icon={<Clock3 className="h-4 w-4"/>} label="Awaiting review" value="6" foot="2 have validation flags" tint="text-amber-600"/>
          <Metric icon={<CheckCircle2 className="h-4 w-4"/>} label="Validated today" value="27" foot="79% of received documents" tint="text-emerald-600"/>
          <Metric icon={<Send className="h-4 w-4"/>} label="Mock TMS handoffs" value="22" foot="All demo records accepted" tint="text-blue-600"/>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="text-sm font-semibold">Recent rate confirmations</h2><p className="mt-1 text-xs text-muted-foreground">Latest documents through extraction and review</p></div><Button asChild variant="ghost" size="sm" className="text-primary"><Link href="/intake">View intake <ArrowRight className="ml-1 h-4 w-4"/></Link></Button></div><div className="divide-y divide-border">{recentDocuments.map((doc) => <div key={doc.name} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"><div className="flex min-w-0 flex-1 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="h-4 w-4"/></div><div className="min-w-0"><p className="truncate text-xs font-semibold">{doc.name}</p><p className="mt-1 truncate text-[11px] text-muted-foreground">{doc.lane}</p></div></div><span className="text-[11px] text-muted-foreground sm:w-32">{doc.date}</span><span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-medium ${statusClass[doc.tone]}`}>{doc.status}</span></div>)}</div><div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">Showing 4 of 34 rate confirmations received today</div></div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Truck className="h-4 w-4"/></span><div><h2 className="text-sm font-semibold">TMS connection</h2><p className="text-xs text-muted-foreground">FreightIQ demo connector</p></div></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">Mock connected</span></div><p className="mt-4 text-xs leading-relaxed text-muted-foreground">Validated rate confirmations are ready to send to the mock TMS. No external system or database is required for this demo.</p><Button asChild variant="outline" size="sm" className="mt-4"><Link href="/automation">View workflow <ArrowRight className="ml-1.5 h-3.5 w-3.5"/></Link></Button></div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Review queue</h2><p className="mt-1 text-xs text-muted-foreground">Documents that need a broker’s attention</p></div><span className="text-xl font-bold">6</span></div><div className="mt-4 space-y-3"><QueueLine icon={<TriangleAlert className="h-4 w-4"/>} title="Validation exceptions" count="2 documents" tint="text-amber-600"/><QueueLine icon={<FileCheck2 className="h-4 w-4"/>} title="Ready for approval" count="4 documents" tint="text-blue-600"/></div><Button asChild variant="ghost" size="sm" className="mt-3 px-0 text-primary"><Link href="/documents">Review documents <ArrowRight className="ml-1.5 h-3.5 w-3.5"/></Link></Button></div>
          </div>
        </section>

        <div className="rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Demo scope:</span> Rate confirmation PDFs, structured extraction, validation, human review, CSV export, and a mock TMS handoff. BOL, POD, and invoice support are planned for a later phase.</div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, foot, tint }: { icon: React.ReactNode; label: string; value: string; foot: string; tint: string }) {
  return <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><span className={tint}>{icon}</span></div><p className="mt-3 text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{foot}</p></div>;
}

function QueueLine({ icon, title, count, tint }: { icon: React.ReactNode; title: string; count: string; tint: string }) {
  return <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><span className={tint}>{icon}</span><span className="text-xs font-medium">{title}</span></div><span className="text-[11px] text-muted-foreground">{count}</span></div>;
}
