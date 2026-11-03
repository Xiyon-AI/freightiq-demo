import Link from "next/link";
import { CheckCircle2, FileCheck2, FileUp, FileText, Send, ShieldCheck, Table2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const requiredFeatures = [
  { title: "PDF upload", description: "Bring a carrier rate confirmation PDF into the demo." },
  { title: "Sample document picker", description: "Start with a provided rate confirmation when you do not have a file handy." },
  { title: "Structured JSON", description: "Review extracted carrier, lane, load, equipment, and rate fields." },
  { title: "Validation engine", description: "Check required values, dates, and rate totals before approval." },
  { title: "Human review", description: "Inspect the source beside its extracted fields and record a note." },
  { title: "CSV export", description: "Download approved rate confirmation data in a simple CSV format." },
  { title: "Mock TMS API", description: "Send approved data to a simulated TMS endpoint and inspect the response." },
];

export default function GuidesPage() {
  return (
    <div className="min-h-full p-4 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-9"><div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"><Truck className="h-3.5 w-3.5"/>Freight broker demo</div><h1 className="text-3xl font-bold tracking-tight">Rate confirmation workflow</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Use FreightIQ to turn a carrier rate confirmation PDF into validated, reviewable data that is ready for a TMS handoff.</p><div className="mt-6 flex flex-wrap gap-3"><Button asChild><Link href="/documents"><FileUp className="mr-1.5 h-4 w-4"/>Open documents</Link></Button></div></div>

        <section><div className="mb-4"><h2 className="text-lg font-semibold">Demo workflow</h2><p className="mt-1 text-sm text-muted-foreground">A broker reviews each confirmation before exporting or sending it to the mock TMS.</p></div><div className="grid gap-4 md:grid-cols-3"><Step number="01" icon={<FileText className="h-5 w-5"/>} title="Upload or choose a sample" description="Use a carrier PDF or the included sample rate confirmation."/><Step number="02" icon={<FileCheck2 className="h-5 w-5"/>} title="Extract and validate" description="Review structured fields and check required values, dates, and totals."/><Step number="03" icon={<Send className="h-5 w-5"/>} title="Approve and hand off" description="Make any corrections, export CSV, or send the record to the mock TMS."/></div></section>

        <section><div className="mb-4"><h2 className="text-lg font-semibold">First demo requirements</h2><p className="mt-1 text-sm text-muted-foreground">The first demo is intentionally focused on one document type.</p></div><div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><div className="divide-y divide-border">{requiredFeatures.map((feature) => <div key={feature.title} className="flex items-start gap-3 p-4 sm:p-5"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-4 w-4"/></span><div><h3 className="text-sm font-semibold">{feature.title}</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{feature.description}</p></div><span className="ml-auto shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Must have</span></div>)}</div></div></section>

        <section className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center gap-2"><Table2 className="h-4 w-4 text-primary"/><h2 className="text-sm font-semibold">Later phase</h2></div><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Real TMS integration and additional document types such as BOL, POD, and invoices are outside the first demo.</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">Real TMS integration</span><span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">BOL</span><span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">POD</span><span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">Invoices</span></div></div><div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary"/><h2 className="text-sm font-semibold">Demo setup</h2></div><p className="mt-2 text-xs leading-relaxed text-muted-foreground">This demo does not require user authentication or a database. Sample records and the TMS handoff are local demo data.</p></div></section>
      </div>
    </div>
  );
}

function Step({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) {
  return <article className="rounded-xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</span><span className="text-xs font-semibold text-muted-foreground">STEP {number}</span></div><h3 className="mt-4 text-sm font-semibold">{title}</h3><p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p></article>;
}
