import {
  ArrowDownToLine,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Filter,
  Inbox,
  Plus,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const intakeItems = [
  { name: "Northstar Logistics — Invoice 10482.pdf", type: "Invoice", source: "Email inbox", date: "Today, 10:42 AM", status: "Ready to review", tone: "green", initials: "NL" },
  { name: "Harbor Freight — Bill of Lading.pdf", type: "Bill of lading", source: "Manual upload", date: "Today, 10:18 AM", status: "Processing", tone: "blue", initials: "HF" },
  { name: "Summit Transport — Rate confirmation.pdf", type: "Rate confirmation", source: "Email inbox", date: "Today, 9:56 AM", status: "Needs attention", tone: "amber", initials: "ST" },
  { name: "Blue Ridge Cargo — Invoice 7781.pdf", type: "Invoice", source: "EDI import", date: "Yesterday, 4:32 PM", status: "Ready to review", tone: "green", initials: "BR" },
];

const statusStyles: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/15",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/15",
};

export default function IntakePage() {
  return (
    <div className="min-h-full p-4 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground"><Inbox className="h-4 w-4" /> Document operations</div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Intake</h1>
            <p className="mt-1 text-sm text-muted-foreground">Bring shipping documents into FreightIQ and track them through processing.</p>
          </div>
          <Button><Plus className="mr-1.5 h-4 w-4" /> New intake</Button>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Intake overview">
          <Metric icon={<Inbox className="h-4 w-4" />} label="Received today" value="28" detail="↑ 12% from yesterday" tint="text-primary" />
          <Metric icon={<Clock3 className="h-4 w-4" />} label="In processing" value="6" detail="Usually takes under 2 min" tint="text-sky-600" />
          <Metric icon={<FileCheck2 className="h-4 w-4" />} label="Ready to review" value="14" detail="Across 3 document types" tint="text-emerald-600" />
          <Metric icon={<CheckCircle2 className="h-4 w-4" />} label="Processed this week" value="142" detail="96.4% straight-through" tint="text-violet-600" />
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><UploadCloud className="h-6 w-6" /></div>
            <h2 className="text-base font-semibold">Add documents to your intake queue</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Upload freight documents or bring them in from a connected source.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2"><Button><UploadCloud className="mr-1.5 h-4 w-4" /> Upload files</Button><Button variant="outline"><ArrowDownToLine className="mr-1.5 h-4 w-4" /> Connect an inbox</Button></div>
            <p className="mt-4 text-xs text-muted-foreground">PDF, PNG, JPG, TIFF, DOCX · Up to 50 MB per file</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-base font-semibold">Recent intake</h2><p className="mt-1 text-xs text-muted-foreground">Documents received across your connected sources</p></div>
            <div className="flex items-center gap-2"><Button variant="outline" size="sm"><Filter className="mr-1.5 h-3.5 w-3.5" /> Filters</Button><Button variant="ghost" size="sm" className="text-primary">View all <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Button></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[740px] text-left text-sm">
              <thead className="bg-muted/30 text-xs font-medium text-muted-foreground"><tr><th className="px-5 py-3">Document</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Received</th><th className="px-4 py-3">Status</th><th className="px-5 py-3"><span className="sr-only">Open</span></th></tr></thead>
              <tbody className="divide-y divide-border">
                {intakeItems.map((item) => <tr key={item.name} className="transition-colors hover:bg-muted/20">
                  <td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="h-4 w-4" /></div><div className="min-w-0"><p className="max-w-[340px] truncate text-sm font-medium text-foreground">{item.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{item.initials} · Freight document</p></div></div></td>
                  <td className="px-4 py-3.5 text-muted-foreground">{item.type}</td><td className="px-4 py-3.5 text-muted-foreground">{item.source}</td><td className="px-4 py-3.5 text-muted-foreground">{item.date}</td>
                  <td className="px-4 py-3.5"><span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[item.tone]}`}><span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />{item.status}</span></td>
                  <td className="px-5 py-3.5 text-right"><Button variant="ghost" size="sm" aria-label={`Open ${item.name}`}>Open</Button></td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground"><span>Showing 4 of 28 documents received today</span><span>Updated just now</span></div>
        </section>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, detail, tint }: { icon: React.ReactNode; label: string; value: string; detail: string; tint: string }) {
  return <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><span className={tint}>{icon}</span></div><p className="mt-3 text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}
