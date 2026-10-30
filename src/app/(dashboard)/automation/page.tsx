import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  MoreHorizontal,
  Play,
  Plus,
  Settings2,
  ShieldCheck,
  Workflow,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const workflows = [
  { name: "Rate confirmation extraction", description: "Read carrier, load, lane, dates, equipment, and agreed rate from a carrier PDF. Validate the extracted record before broker approval.", icon: Workflow, trigger: "When a rate confirmation PDF is added", runs: "92 runs", success: "94.6%", updated: "Demo workflow", active: true, color: "text-blue-600 bg-blue-50" },
];

export default function AutomationPage() {
  return (
    <div className="min-h-full p-4 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground"><Workflow className="h-4 w-4" /> Document operations</div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Automation</h1>
            <p className="mt-1 text-sm text-muted-foreground">Review the first demo workflow for carrier rate confirmation PDFs.</p>
          </div>
          <Button><Plus className="mr-1.5 h-4 w-4" /> Create workflow</Button>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Automation overview">
          <Metric icon={<Workflow className="h-4 w-4" />} label="Demo workflow" value="1" detail="Rate confirmations only" tint="text-primary" />
          <Metric icon={<Zap className="h-4 w-4" />} label="Sample runs" value="92" detail="Using demo documents" tint="text-amber-600" />
          <Metric icon={<Check className="h-4 w-4" />} label="Validation pass rate" value="94.6%" detail="Sample workflow data" tint="text-emerald-600" />
          <Metric icon={<Clock3 className="h-4 w-4" />} label="Handoff target" value="Mock TMS" detail="No external connection" tint="text-violet-600" />
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-base font-semibold">First demo workflow</h2><p className="mt-1 text-xs text-muted-foreground">Rate confirmation extraction and validation</p></div>
            <Button variant="outline" size="sm"><Settings2 className="mr-1.5 h-3.5 w-3.5" /> Workflow settings</Button>
          </div>
          <div className="divide-y divide-border">
            {workflows.map((flow) => {
              const Icon = flow.icon;
              return <article key={flow.name} className="flex flex-col gap-4 p-5 transition-colors hover:bg-muted/20 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3.5"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${flow.color}`}><Icon className="h-5 w-5" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold">{flow.name}</h3><span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${flow.active ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}><span className={`h-1.5 w-1.5 rounded-full ${flow.active ? "bg-emerald-500" : "bg-muted-foreground/50"}`} />{flow.active ? "Active" : "Paused"}</span></div><p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">{flow.description}</p><p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Zap className="h-3.5 w-3.5 text-primary" />{flow.trigger}</p></div></div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 pl-[54px] text-xs sm:grid-cols-3 lg:w-[390px] lg:shrink-0 lg:pl-0"><div><p className="text-muted-foreground">Runs this month</p><p className="mt-1 font-semibold text-foreground">{flow.runs}</p></div><div><p className="text-muted-foreground">Success rate</p><p className="mt-1 font-semibold text-emerald-700">{flow.success}</p></div><div className="col-span-2 sm:col-span-1"><p className="text-muted-foreground">Last changed</p><p className="mt-1 font-medium text-foreground">{flow.updated}</p></div></div>
                <div className="flex items-center justify-end gap-2 lg:ml-2"><Button variant="outline" size="sm"><Play className="mr-1.5 h-3.5 w-3.5" /> Test run</Button><Button variant="ghost" size="icon" aria-label={`More options for ${flow.name}`}><MoreHorizontal className="h-4 w-4" /></Button></div>
              </article>;
            })}
          </div>
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground"><span>Showing 1 demo workflow</span><span className="inline-flex items-center gap-1 font-medium text-muted-foreground">CSV export and mock TMS handoff included <ArrowRight className="h-3.5 w-3.5" /></span></div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Recent activity</h2><p className="mt-1 text-xs text-muted-foreground">Latest workflow runs across your workspace</p></div><Button variant="ghost" size="sm" className="text-primary">View history <ChevronRight className="ml-1 h-4 w-4" /></Button></div><div className="mt-4 space-y-4">
            <ActivityRow title="Rate confirmation validated" detail="Northstar Logistics · RC-10482.pdf" time="Today, 10:42 AM" status="Ready to review" tone="green" />
            <ActivityRow title="Rate sent to mock TMS" detail="Harbor Freight · RC-8831.pdf" time="Today, 10:18 AM" status="Accepted" tone="green" />
            <ActivityRow title="Rate total flagged for review" detail="Summit Transport · RC-33019.pdf" time="Today, 9:56 AM" status="Needs review" tone="amber" />
          </div></div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><ShieldCheck className="h-4 w-4" /></div><h2 className="text-sm font-semibold">Demo handoff health</h2></div><div className="mt-5 flex items-end justify-between"><div><p className="text-3xl font-bold tracking-tight">98.9%</p><p className="mt-1 text-xs text-muted-foreground">Mock TMS acceptance rate</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Demo mode</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-[98.9%] rounded-full bg-emerald-500" /></div><div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>Accepted 91</span><span>Needs review 1</span></div></div>
        </section>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, detail, tint }: { icon: React.ReactNode; label: string; value: string; detail: string; tint: string }) {
  return <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><span className={tint}>{icon}</span></div><p className="mt-3 text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}

function ActivityRow({ title, detail, time, status, tone }: { title: string; detail: string; time: string; status: string; tone: "green" | "amber" }) {
  return <div className="flex items-start gap-3"><div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone === "green" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{tone === "green" ? <Check className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"><p className="text-xs font-semibold">{title}</p><span className={`text-[11px] font-medium ${tone === "green" ? "text-emerald-700" : "text-amber-700"}`}>{status}</span></div><p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p><p className="mt-1 text-[11px] text-muted-foreground">{time}</p></div></div>;
}
