import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  MoreHorizontal,
  PieChart,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const weeklyActivity = [
  { day: "Mon", received: 45, processed: 38 },
  { day: "Tue", received: 62, processed: 51 },
  { day: "Wed", received: 54, processed: 47 },
  { day: "Thu", received: 78, processed: 65 },
  { day: "Fri", received: 68, processed: 60 },
  { day: "Sat", received: 37, processed: 31 },
  { day: "Sun", received: 49, processed: 43 },
];

const documentTypes = [
  { name: "Invoices", total: 418, percent: 42, color: "bg-primary" },
  { name: "Bills of lading", total: 276, percent: 28, color: "bg-blue-500" },
  { name: "Proof of delivery", total: 192, percent: 19, color: "bg-violet-500" },
  { name: "Other documents", total: 108, percent: 11, color: "bg-amber-500" },
];

const topWorkflows = [
  { name: "Invoice processing", runs: 324, rate: "98.8%", avg: "38 sec", icon: FileText, color: "bg-blue-50 text-blue-600" },
  { name: "Proof of delivery review", runs: 186, rate: "96.2%", avg: "52 sec", icon: FileCheck2, color: "bg-emerald-50 text-emerald-600" },
  { name: "Rate confirmation capture", runs: 92, rate: "94.6%", avg: "44 sec", icon: PieChart, color: "bg-violet-50 text-violet-600" },
];

export default function AnalyticsPage() {
  const maxActivity = Math.max(...weeklyActivity.map((day) => day.received));

  return (
    <div className="min-h-full p-4 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground"><BarChart3 className="h-4 w-4" /> Operations insights</div><h1 className="text-2xl font-bold tracking-tight">Analytics</h1><p className="mt-1 text-sm text-muted-foreground">Track document throughput, processing quality, and automation performance.</p></div>
          <Button variant="outline"><CalendarDays className="mr-1.5 h-4 w-4" /> Last 7 days <span className="ml-1 text-muted-foreground">⌄</span></Button>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Analytics summary">
          <Metric icon={<FileText className="h-4 w-4" />} label="Documents received" value="994" change="12.8%" detail="vs previous 7 days" direction="up" tint="text-primary" />
          <Metric icon={<CheckCircle2 className="h-4 w-4" />} label="Successfully processed" value="927" change="4.2%" detail="vs previous 7 days" direction="up" tint="text-emerald-600" />
          <Metric icon={<TriangleAlert className="h-4 w-4" />} label="Flagged for review" value="67" change="2.1%" detail="vs previous 7 days" direction="down" tint="text-amber-600" />
          <Metric icon={<Clock3 className="h-4 w-4" />} label="Average processing time" value="46 sec" change="8.6%" detail="faster than previous week" direction="up" tint="text-violet-600" />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between"><div><h2 className="text-sm font-semibold">Document volume</h2><p className="mt-1 text-xs text-muted-foreground">Documents received and processed this week</p></div><Button variant="ghost" size="icon" aria-label="More chart options"><MoreHorizontal className="h-4 w-4" /></Button></div>
            <div className="mt-6 flex items-center gap-5 text-xs"><span className="flex items-center gap-2 text-muted-foreground"><span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Received</span><span className="flex items-center gap-2 text-muted-foreground"><span className="h-2.5 w-2.5 rounded-sm bg-primary/30" /> Processed</span></div>
            <div className="mt-4 grid h-56 grid-cols-7 items-end gap-3 border-b border-border pb-2 sm:gap-5">
              {weeklyActivity.map((item) => <div key={item.day} className="flex h-full flex-col items-center justify-end gap-2"><div className="flex h-full w-full max-w-12 items-end justify-center gap-1"><div className="w-1/2 rounded-t-md bg-primary/30" style={{ height: `${(item.processed / maxActivity) * 90}%` }} /><div className="w-1/2 rounded-t-md bg-primary" style={{ height: `${(item.received / maxActivity) * 90}%` }} /></div><span className="text-[11px] text-muted-foreground">{item.day}</span></div>)}
            </div>
            <div className="mt-3 flex justify-between text-[10px] text-muted-foreground"><span>0</span><span>20</span><span>40</span><span>60</span><span>80 documents</span></div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div><h2 className="text-sm font-semibold">Documents by type</h2><p className="mt-1 text-xs text-muted-foreground">Breakdown of received documents</p></div>
            <div className="mt-6 flex items-center justify-center"><div className="relative flex h-40 w-40 items-center justify-center rounded-full" style={{ background: "conic-gradient(var(--color-primary) 0% 42%, #3b82f6 42% 70%, #8b5cf6 70% 89%, #f59e0b 89% 100%)" }}><div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-card"><span className="text-2xl font-bold">994</span><span className="text-[11px] text-muted-foreground">documents</span></div></div></div>
            <div className="mt-5 space-y-3">{documentTypes.map((item) => <div key={item.name} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2 text-muted-foreground"><span className={`h-2.5 w-2.5 rounded-sm ${item.color}`} />{item.name}</span><span className="font-medium text-foreground">{item.total} <span className="ml-1 text-muted-foreground">{item.percent}%</span></span></div>)}</div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="text-sm font-semibold">Workflow performance</h2><p className="mt-1 text-xs text-muted-foreground">Automation runs over the last 7 days</p></div><Button variant="ghost" size="sm" className="text-primary">View workflows <ArrowRight className="ml-1.5 h-4 w-4" /></Button></div>
            <div className="divide-y divide-border">{topWorkflows.map((workflow) => { const Icon = workflow.icon; return <div key={workflow.name} className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_90px_90px_90px] sm:items-center"><div className="flex min-w-0 items-center gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${workflow.color}`}><Icon className="h-4 w-4" /></span><span className="truncate text-xs font-medium">{workflow.name}</span></div><MetricCell label="Runs" value={String(workflow.runs)} /><MetricCell label="Success rate" value={workflow.rate} green /><MetricCell label="Avg. time" value={workflow.avg} /></div>; })}</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div><h2 className="text-sm font-semibold">Processing quality</h2><p className="mt-1 text-xs text-muted-foreground">Review outcomes this week</p></div>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-muted/30 p-4"><div><p className="text-xs text-muted-foreground">Straight-through processing</p><p className="mt-1 text-2xl font-bold">93.3%</p></div><div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><TrendingUp className="h-5 w-5" /></div></div>
            <div className="mt-5 space-y-4"><QualityRow label="Processed without review" value="927" percent={93.3} color="bg-emerald-500" /><QualityRow label="Sent for manual review" value="51" percent={5.1} color="bg-amber-500" /><QualityRow label="Could not be processed" value="16" percent={1.6} color="bg-rose-500" /></div>
            <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground"><ArrowDownRight className="h-4 w-4 text-emerald-600" /> Review rate decreased by 2.1% this week</div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, change, detail, direction, tint }: { icon: React.ReactNode; label: string; value: string; change: string; detail: string; direction: "up" | "down"; tint: string }) {
  return <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><span className={tint}>{icon}</span></div><p className="mt-3 text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><span className={`inline-flex items-center font-medium ${direction === "up" ? "text-emerald-700" : "text-emerald-700"}`}>{direction === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}{change}</span>{detail}</p></div>;
}

function MetricCell({ label, value, green = false }: { label: string; value: string; green?: boolean }) {
  return <div><p className="text-[10px] text-muted-foreground sm:hidden">{label}</p><p className={`text-xs font-semibold ${green ? "text-emerald-700" : "text-foreground"}`}>{value}</p></div>;
}

function QualityRow({ label, value, percent, color }: { label: string; value: string; percent: number; color: string }) {
  return <div><div className="mb-1.5 flex justify-between gap-2 text-xs"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value} <span className="text-muted-foreground">({percent}%)</span></span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} /></div></div>;
}
