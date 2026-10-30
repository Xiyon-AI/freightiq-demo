import {
  ArrowRight,
  BookOpen,
  Bot,
  FileText,
  Globe2,
  Library,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge",
  description: "Manage the reference content used across FreightIQ",
};

export default function KnowledgePage() {
  return (
    <div className="min-h-full p-4 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground"><BookOpen className="h-4 w-4"/>Reference workspace</div><h1 className="text-2xl font-bold tracking-tight">Knowledge</h1><p className="mt-1 text-sm text-muted-foreground">Organize the information your team and automation use every day.</p></div>
          <Button><Plus className="mr-1.5 h-4 w-4"/> Add knowledge source</Button>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Knowledge overview">
          <Metric icon={<Library className="h-4 w-4"/>} label="Knowledge sources" value="12" detail="Across 4 collections" tint="text-primary"/>
          <Metric icon={<FileText className="h-4 w-4"/>} label="Reference files" value="86" detail="All sources indexed" tint="text-blue-600"/>
          <Metric icon={<Globe2 className="h-4 w-4"/>} label="Web pages" value="24" detail="Last synced today" tint="text-violet-600"/>
          <Metric icon={<ShieldCheck className="h-4 w-4"/>} label="Source health" value="100%" detail="No sync issues" tint="text-emerald-600"/>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-base font-semibold">Find an answer</h2><p className="mt-1 text-xs text-muted-foreground">Search across indexed documents and reference sources</p></div><div className="flex h-10 w-full items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground sm:max-w-md"><Search className="h-4 w-4 shrink-0"/><span>Search your knowledge base...</span><kbd className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px]">⌘ K</kbd></div></div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between"><div><h2 className="text-base font-semibold">Collections</h2><p className="mt-1 text-xs text-muted-foreground">Grouped reference content for your operations</p></div><Button variant="ghost" size="sm" className="text-primary">View all <ArrowRight className="ml-1 h-4 w-4"/></Button></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Collection icon={<FileText className="h-5 w-5"/>} tint="bg-blue-50 text-blue-600" title="Freight documents" detail="Policies, forms, and document handling guides" count="32 sources" updated="Updated today"/>
            <Collection icon={<Bot className="h-5 w-5"/>} tint="bg-violet-50 text-violet-600" title="Operations playbook" detail="Standard operating procedures and team workflows" count="18 sources" updated="Updated yesterday"/>
            <Collection icon={<Globe2 className="h-5 w-5"/>} tint="bg-emerald-50 text-emerald-600" title="Carrier network" detail="Carrier details, service areas, and reference links" count="24 sources" updated="Synced 2 hours ago"/>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="text-base font-semibold">Recent sources</h2><p className="mt-1 text-xs text-muted-foreground">Recently added to your knowledge workspace</p></div><Button variant="outline" size="sm">Browse sources</Button></div>
          <div className="divide-y divide-border">
            <Source title="Freight claims handling guide.pdf" group="Freight documents · PDF document" updated="Added today" status="Indexed"/>
            <Source title="Carrier onboarding procedures.docx" group="Operations playbook · Word document" updated="Added yesterday" status="Indexed"/>
            <Source title="Regional service coverage" group="Carrier network · Website" updated="Synced 2 hours ago" status="Synced"/>
          </div>
        </section>

        <div className="flex flex-col justify-between gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 sm:flex-row sm:items-center"><div className="flex items-start gap-3"><div className="mt-0.5 text-primary"><Sparkles className="h-4 w-4"/></div><div><p className="text-sm font-medium">Need to manage uploaded freight files?</p><p className="mt-1 text-xs text-muted-foreground">Open Documents to upload files, review extracted data, and manage your document library.</p></div></div><Button asChild variant="outline" size="sm"><Link href="/documents">Go to Documents <ArrowRight className="ml-1.5 h-4 w-4"/></Link></Button></div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, detail, tint }: { icon: React.ReactNode; label: string; value: string; detail: string; tint: string }) {
  return <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><span className={tint}>{icon}</span></div><p className="mt-3 text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}

function Collection({ icon, tint, title, detail, count, updated }: { icon: React.ReactNode; tint: string; title: string; detail: string; count: string; updated: string }) {
  return <article className="rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/30"><div className="flex items-start justify-between"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>{icon}</div><button className="text-sm text-muted-foreground" aria-label={`More options for ${title}`}>···</button></div><h3 className="mt-4 text-sm font-semibold">{title}</h3><p className="mt-1 min-h-10 text-xs leading-relaxed text-muted-foreground">{detail}</p><div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground"><span>{count}</span><span>{updated}</span></div></article>;
}

function Source({ title, group, updated, status }: { title: string; group: string; updated: string; status: string }) {
  return <div className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center"><div className="flex min-w-0 flex-1 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground"><FileText className="h-4 w-4"/></div><div className="min-w-0"><p className="truncate text-sm font-medium">{title}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{group}</p></div></div><span className="text-xs text-muted-foreground sm:w-36">{updated}</span><span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>{status}</span></div>;
}
