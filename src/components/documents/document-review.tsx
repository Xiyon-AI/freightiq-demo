"use client";

import { useState } from "react";
import { ArrowLeft, Check, CheckCircle2, CircleAlert, Code2, Download, FileText, Send, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface ReviewDocument {
  id: string;
  filename: string;
  url?: string;
  file?: File;
  sample?: boolean;
}

const SAMPLE_FIELDS = {
  confirmation_number: "RC-10482",
  carrier_name: "Northstar Logistics LLC",
  broker_name: "FreightIQ Brokerage",
  load_number: "LD-572091",
  origin: "Dallas, TX",
  destination: "Atlanta, GA",
  pickup_date: "2025-04-16",
  delivery_date: "2025-04-18",
  equipment_type: "53' Dry Van",
  linehaul_rate: 2450,
  fuel_surcharge: 325,
  total_rate: 2775,
  currency: "USD",
};

const fields = Object.entries(SAMPLE_FIELDS);

export function DocumentReview({ document, onClose }: { document: ReviewDocument; onClose: () => void }) {
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [showJson, setShowJson] = useState(false);
  const [values, setValues] = useState<Record<string, string | number>>({ ...SAMPLE_FIELDS });
  const isPdf = document.filename.toLowerCase().endsWith(".pdf");
  const hasSampleData = !!document.sample;

  const updateField = (key: string, value: string) => setValues((previous) => ({ ...previous, [key]: value }));

  const exportCsv = () => {
    const headers = Object.keys(values);
    const row = headers.map((key) => `"${String(values[key] ?? "").replaceAll('"', '""')}"`).join(",");
    const csv = `${headers.join(",")}\n${row}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${String(values.confirmation_number || "rate-confirmation")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("CSV exported.");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-3"><Button variant="ghost" size="icon" onClick={onClose} aria-label="Back to documents"><ArrowLeft className="h-4 w-4" /></Button><div className="min-w-0"><p className="text-xs text-muted-foreground">Rate confirmations <span className="mx-1">/</span> Review</p><h1 className="truncate text-sm font-semibold">{document.filename}</h1></div></div>
        <span className="hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground sm:flex"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />{hasSampleData ? "Sample extraction" : "PDF received"}</span>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:p-6">
        <section className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3"><div className="flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4 text-primary" /> Source PDF</div><span className="text-xs text-muted-foreground">{hasSampleData ? "Sample · 1 page" : "Uploaded file"}</span></div>
          <div className="flex flex-1 items-center justify-center overflow-auto bg-muted/40 p-4">
            {document.url && isPdf ? <iframe title={`Preview of ${document.filename}`} src={document.url} className="h-full min-h-[500px] w-full rounded-md bg-white" /> : hasSampleData ? <SampleRateConfirmation values={values} /> : <div className="max-w-sm rounded-xl border border-border bg-card p-8 text-center"><FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground"/><p className="text-sm font-medium">PDF ready for review</p><p className="mt-1 text-xs text-muted-foreground">This demo does not connect an extraction service for uploaded files. Use the sample rate confirmation to explore the completed review flow.</p></div>}
          </div>
        </section>

        <section className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_230px]">
          <div className="min-h-[350px] overflow-auto rounded-xl border border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">Structured rate data</h2><p className="mt-1 text-xs text-muted-foreground">{hasSampleData ? "Review and correct the extracted fields" : "Sample values are shown with the built-in sample document"}</p></div>{hasSampleData && <Button variant="outline" size="sm" onClick={() => setShowJson((value) => !value)}><Code2 className="mr-1.5 h-3.5 w-3.5"/>{showJson ? "Fields" : "JSON"}</Button>}</div>
            {hasSampleData ? showJson ? <pre className="overflow-auto rounded-lg bg-muted/40 p-4 text-xs leading-relaxed">{JSON.stringify(values, null, 2)}</pre> : <div className="space-y-2">{fields.map(([key]) => <label key={key} className="grid grid-cols-[minmax(115px,0.8fr)_minmax(120px,1.2fr)_42px] items-center gap-2 rounded-lg border border-border px-3 py-2"><span className="truncate text-[11px] font-medium text-muted-foreground">{key.replaceAll("_", " ")}</span><input value={String(values[key] ?? "")} onChange={(event) => updateField(key, event.target.value)} className="min-w-0 rounded border border-transparent bg-transparent px-1 py-1 text-xs font-medium outline-none focus:border-primary/30 focus:bg-background" aria-label={key.replaceAll("_", " ")}/><span className="text-right text-[10px] font-semibold text-emerald-700">98%</span></label>)}</div> : <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 text-center"><FileText className="mb-3 h-8 w-8 text-muted-foreground/60"/><p className="text-sm font-medium">Sample extraction available</p><p className="mt-1 max-w-xs text-xs text-muted-foreground">Load the included sample rate confirmation to view structured fields and validation results.</p></div>}
          </div>
          <div className="rounded-xl border border-border bg-card p-4"><h2 className="text-sm font-semibold">Validation</h2>{hasSampleData ? <><div className="mt-4 flex items-start gap-3 rounded-lg bg-emerald-50 p-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"/><div><p className="text-xs font-semibold text-emerald-800">4 checks passed</p><p className="mt-1 text-xs leading-relaxed text-emerald-700">Required fields, dates, and rate totals are valid.</p></div></div><div className="mt-4 space-y-3">{["Required fields present", "Pickup date is before delivery", "Rate components match total", "Currency is supported"].map((check) => <p key={check} className="flex items-start gap-2 text-[11px] text-muted-foreground"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"/>{check}</p>)}</div></> : <div className="mt-4 flex items-start gap-3 rounded-lg bg-muted/40 p-3"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"/><div><p className="text-xs font-medium">Awaiting extraction</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Validation results will appear here when extraction is available.</p></div></div>}<div className="mt-5 border-t border-border pt-4"><h3 className="text-xs font-semibold">TMS handoff</h3><p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Truck className="h-4 w-4 text-primary"/>Mock TMS · Demo mode</p></div></div>
        </section>
      </main>

      <footer className="shrink-0 border-t border-border bg-card px-4 py-3 lg:px-6"><div className="mx-auto grid max-w-screen-2xl gap-4 lg:grid-cols-[190px_minmax(180px,1fr)_auto]"><div className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2"><div className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-bold ${hasSampleData ? "border-primary/30 text-primary" : "border-border text-muted-foreground"}`}>{hasSampleData ? "98.6%" : "—"}</div><div><p className="text-xs font-semibold">Extraction confidence</p><p className="mt-0.5 text-xs text-muted-foreground">{hasSampleData ? "Ready for broker review" : "Awaiting extraction"}</p></div></div><label className="min-w-0"><span className="mb-1 block text-xs font-semibold">Review notes</span><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add a broker note (optional)" className="min-h-11 resize-none" /></label><div className="flex flex-wrap items-end gap-2"><Button variant="outline" onClick={() => setMessage("Added to the broker review queue.")}><Send className="mr-2 h-4 w-4"/>Send to Review</Button><Button variant="outline" disabled={!hasSampleData} onClick={exportCsv}><Download className="mr-2 h-4 w-4"/>Export CSV</Button><Button disabled={!hasSampleData} onClick={() => setMessage("Mock TMS accepted the rate confirmation.")}><Truck className="mr-2 h-4 w-4"/>Send to Mock TMS</Button></div></div>{message && <p role="status" className="mx-auto mt-2 max-w-screen-2xl text-right text-xs text-emerald-700">{message}</p>}</footer>
    </div>
  );
}

function SampleRateConfirmation({ values }: { values: Record<string, string | number> }) {
  return <article className="w-full max-w-[560px] border border-neutral-200 bg-white px-8 py-9 text-neutral-800 shadow-md sm:px-10"><div className="flex items-start justify-between border-b-2 border-neutral-800 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Northstar Logistics</p><p className="mt-1 text-lg font-bold">RATE CONFIRMATION</p></div><div className="text-right"><p className="text-[10px] text-neutral-500">CONFIRMATION NO.</p><p className="font-mono text-sm font-bold">{values.confirmation_number}</p></div></div><div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 text-xs"><SampleValue label="Carrier" value={values.carrier_name}/><SampleValue label="Broker" value={values.broker_name}/><SampleValue label="Load number" value={values.load_number}/><SampleValue label="Equipment" value={values.equipment_type}/><SampleValue label="Pickup" value={`${values.origin} · ${values.pickup_date}`}/><SampleValue label="Delivery" value={`${values.destination} · ${values.delivery_date}`}/></div><div className="mt-6 rounded bg-neutral-100 px-3 py-2 text-[10px] font-bold uppercase tracking-wider">Agreed rate</div><div className="mt-3 space-y-2 text-xs"><div className="flex justify-between"><span>Linehaul</span><span>${Number(values.linehaul_rate).toLocaleString()}</span></div><div className="flex justify-between"><span>Fuel surcharge</span><span>${Number(values.fuel_surcharge).toLocaleString()}</span></div><div className="flex justify-between border-t border-neutral-300 pt-2 font-bold"><span>Total rate ({values.currency})</span><span>${Number(values.total_rate).toLocaleString()}</span></div></div><p className="mt-8 border-t border-neutral-200 pt-3 text-[9px] leading-relaxed text-neutral-500">Demo sample for FreightIQ rate confirmation review. This document contains fictional shipment details.</p></article>;
}

function SampleValue({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><p className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500">{label}</p><p className="mt-1 font-medium">{value}</p></div>;
}
