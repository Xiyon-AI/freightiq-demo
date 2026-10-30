"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, BadgeCheck, Building2, Check, CheckCircle2, CircleAlert, CircleDollarSign, ClipboardList, Code2, Download, FileBadge, FileText, Hash, List, LoaderCircle, MapPin, Package, Scale, Send, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { LoadDocumentT } from "@/lib/schema";
import type { ValidationIssue } from "@/lib/validate";

const PdfPreview = dynamic(() => import("./pdf-preview").then((module) => module.PdfPreview), {
  ssr: false,
  loading: () => <div className="p-8 text-sm text-muted-foreground">Loading PDF viewer…</div>,
});

export interface ReviewDocument {
  id: string;
  filename: string;
  url?: string;
  file?: File;
  sample?: boolean;
}

const SAMPLE_FIELDS = {
  doc_type: "rate_confirmation",
  load_number: "LD-572091",
  broker_name: "FreightIQ Brokerage",
  carrier_name: "Northstar Logistics LLC",
  carrier_mc: "123456",
  carrier_dot: "654321",
  equipment: "53' Dry Van",
  commodity: "General freight",
  weight_lbs: 42000,
  reference_numbers: ["RC-10482"],
  stops: [
    { type: "pickup", name: "Northstar Shipper", address: "100 Commerce St", city: "Dallas", state: "TX", date: "2025-04-16", window_start: "08:00", window_end: "12:00" },
    { type: "delivery", name: "Receiving Warehouse", address: "200 Peachtree St", city: "Atlanta", state: "GA", date: "2025-04-18", window_start: "08:00", window_end: "16:00" },
  ],
  line_items: [{ description: "Linehaul", amount: 2450 }, { description: "Fuel surcharge", amount: 325 }],
  total_rate: 2775,
  currency: "USD",
  uncertain_fields: [],
} satisfies LoadDocumentT;

type ExtractionState = "idle" | "loading" | "success" | "error";
type ExtractionResponse = { fields: LoadDocumentT; fieldConfidence?: Partial<Record<keyof LoadDocumentT, number>>; issues?: ValidationIssue[]; error?: string };

const FIELD_META = {
  doc_type: { label: "Document Type", icon: FileBadge },
  load_number: { label: "Load Number", icon: Hash },
  broker_name: { label: "Broker Name", icon: Building2 },
  carrier_name: { label: "Carrier Name", icon: Truck },
  carrier_mc: { label: "Carrier MC", icon: BadgeCheck },
  carrier_dot: { label: "Carrier DOT", icon: BadgeCheck },
  equipment: { label: "Equipment", icon: Package },
  commodity: { label: "Commodity", icon: Package },
  weight_lbs: { label: "Weight", icon: Scale },
  reference_numbers: { label: "Reference Numbers", icon: ClipboardList },
  stops: { label: "Stops", icon: MapPin },
  line_items: { label: "Line Items", icon: List },
  total_rate: { label: "Total Rate", icon: CircleDollarSign },
  currency: { label: "Currency", icon: CircleDollarSign },
  uncertain_fields: { label: "Uncertain Fields", icon: CircleAlert },
} satisfies Record<keyof LoadDocumentT, { label: string; icon: typeof FileText }>;

const extractionRequests = new WeakMap<File, Promise<ExtractionResponse>>();

function extractFileOnce(file: File): Promise<ExtractionResponse> {
  const existingRequest = extractionRequests.get(file);
  if (existingRequest) return existingRequest;

  const request = (async () => {
    const seen = JSON.parse(sessionStorage.getItem("freightiq-seen-load-numbers") || "[]") as string[];
    const form = new FormData();
    form.append("file", file);
    form.append("seen_load_numbers", JSON.stringify(seen));
    const response = await fetch("/api/extract", { method: "POST", body: form });
    const result = await response.json() as ExtractionResponse;
    if (!response.ok) throw new Error(result.error || "Document extraction failed.");
    const loadNumber = result.fields?.load_number;
    if (typeof loadNumber === "string" && loadNumber.trim()) {
      sessionStorage.setItem("freightiq-seen-load-numbers", JSON.stringify([...new Set([...seen, loadNumber])]));
    }
    return result;
  })();

  extractionRequests.set(file, request);
  return request;
}

export function DocumentReview({ document, onClose }: { document: ReviewDocument; onClose: () => void }) {
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [showJson, setShowJson] = useState(false);
  const [fields, setFields] = useState<LoadDocumentT | null>(document.sample ? SAMPLE_FIELDS : null);
  const [fieldConfidence, setFieldConfidence] = useState<Partial<Record<keyof LoadDocumentT, number>>>({});
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [extractState, setExtractState] = useState<ExtractionState>(document.sample ? "success" : "idle");
  const [extractError, setExtractError] = useState("");
  const isPdf = document.filename.toLowerCase().endsWith(".pdf");
  const issueFields = useMemo(() => new Set(issues.map((issue) => issue.field.split(".")[0])), [issues]);

  useEffect(() => {
    if (!document.file || document.sample) return;
    let active = true;
    const runExtraction = async () => {
      setExtractState("loading");
      setExtractError("");
      setFieldConfidence({});
      try {
        const result = await extractFileOnce(document.file as File);
        if (!active) return;
        setFields(result.fields as LoadDocumentT);
        setFieldConfidence(result.fieldConfidence || {});
        setIssues(Array.isArray(result.issues) ? result.issues as ValidationIssue[] : []);
        setExtractState("success");
      } catch (error) {
        if (!active) return;
        setExtractError(error instanceof Error ? error.message : "Document extraction failed.");
        setExtractState("error");
      }
    };
    void runExtraction();
    return () => { active = false; };
  }, [document.file, document.sample]);

  const exportCsv = () => {
    if (!fields) return;
    const headers = Object.keys(fields);
    const row = headers.map((key) => `"${String(fields[key as keyof LoadDocumentT] ?? "").replaceAll('"', '""')}"`).join(",");
    const csv = `${headers.join(",")}\n${row}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${fields.load_number || "rate-confirmation"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("CSV exported.");
  };

  const renderField = (key: keyof LoadDocumentT, value: LoadDocumentT[keyof LoadDocumentT]) => {
    const fieldIssues = issues.filter((issue) => issue.field === key || issue.field.startsWith(`${key}.`));
    const flagged = fieldIssues.length > 0;
    const Icon = FIELD_META[key].icon;
    const confidence = fieldConfidence[key];
    let summary: string;
    if (value === null) summary = "Not found";
    else if (Array.isArray(value)) {
      if (key === "reference_numbers") summary = value.length ? value.join(", ") : "None";
      else if (key === "uncertain_fields") summary = value.length ? `${value.length} fields need review` : "None";
      else summary = `${value.length} ${key === "stops" ? "stops" : key === "line_items" ? "line items" : "items"}`;
    } else if (key === "weight_lbs" && typeof value === "number") summary = `${value.toLocaleString()} lbs`;
    else if (key === "total_rate" && typeof value === "number") summary = `${fields?.currency || "USD"} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    else summary = String(value);

    return <div id={`field-${key}`} key={key} className={`grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_auto_auto] items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors sm:gap-3 ${flagged ? "border-amber-300 bg-amber-50/60" : "border-border bg-card hover:bg-muted/30"}`}>
      <div className="flex min-w-0 items-center gap-2"><Icon className="h-4 w-4 shrink-0 text-primary"/><span className="truncate text-xs font-medium">{FIELD_META[key].label}</span></div>
      <p className={`min-w-0 break-words text-xs sm:text-sm ${value === null ? "italic text-muted-foreground" : "text-foreground"}`}>{summary}</p>
      <span title="Model-reported estimate; not a calibrated probability" className="rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-[10px] font-semibold tabular-nums text-primary">{confidence === undefined ? "—" : `${confidence}%`}</span>
      {flagged ? <CircleAlert className="h-4 w-4 text-amber-600" aria-label="Needs review"/> : <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-label="No validation issues"/>}
    </div>;
  };

  const averageConfidence = Object.values(fieldConfidence).length
    ? Math.round(Object.values(fieldConfidence).reduce((sum, value) => sum + (value || 0), 0) / Object.values(fieldConfidence).length)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-3"><Button variant="ghost" size="icon" onClick={onClose} aria-label="Back to documents"><ArrowLeft className="h-4 w-4" /></Button><div className="min-w-0"><p className="text-xs text-muted-foreground">Rate confirmations <span className="mx-1">/</span> Review</p><h1 className="truncate text-sm font-semibold">{document.filename}</h1></div></div>
        <span className="hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground sm:flex"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />{document.sample ? "Sample extraction" : extractState === "loading" ? "Extracting document" : extractState === "success" ? "Extraction complete" : "PDF received"}</span>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:p-6">
        <section className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3"><div className="flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4 text-primary" /> Source {isPdf ? "PDF" : "Document"}</div><span className="text-xs text-muted-foreground">{document.sample ? "Sample · 1 page" : "Uploaded file"}</span></div>
          <div className="relative flex flex-1 justify-center overflow-auto bg-muted/40 p-4">
            {document.sample ? <SampleRateConfirmation fields={fields || SAMPLE_FIELDS}/> : document.file && isPdf ? <PdfPreview file={document.file} filename={document.filename}/> : <div className="p-8 text-sm text-muted-foreground">Preview is unavailable for this file.</div>}
          </div>
        </section>

        <section className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_230px]">
          <div className="min-h-[350px] overflow-auto rounded-xl border border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between gap-3"><div><div className="flex items-center gap-2"><h2 className="text-sm font-semibold">Structured rate data</h2>{fields && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{Object.keys(fields).length} fields</span>}</div><p className="mt-1 text-xs text-muted-foreground">{extractState === "loading" ? "OpenRouter is extracting document fields…" : fields ? "Review extracted values and validation flags" : "Extracted fields will appear here"}</p></div>{fields && <Button variant="outline" size="sm" onClick={() => setShowJson((value) => !value)}><Code2 className="mr-1.5 h-3.5 w-3.5"/>{showJson ? "Fields" : "JSON"}</Button>}</div>
            {extractState === "loading" && !fields ? <div className="flex min-h-52 flex-col items-center justify-center text-sm text-muted-foreground"><LoaderCircle className="mb-3 h-6 w-6 animate-spin text-primary"/>Extracting document data…</div> : extractState === "error" ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-4"><p className="text-sm font-semibold text-rose-800">Extraction failed</p><p className="mt-1 text-xs text-rose-700">{extractError}</p><p className="mt-2 text-xs text-rose-700">Check OPENROUTER_API_KEY, model availability, and your free usage limits. PDFs are limited to 4 MB in this demo.</p></div> : fields ? showJson ? <pre className="overflow-auto rounded-lg bg-muted/40 p-4 text-xs leading-relaxed">{JSON.stringify(fields, null, 2)}</pre> : <div className="space-y-5">
              <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_auto_auto] gap-2 px-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:gap-3"><span>Field</span><span>Extracted value</span><span title="Model-reported estimate; not a calibrated probability">Confidence*</span><span>Status</span></div>
              <div className="space-y-2">{(Object.entries(fields) as [keyof LoadDocumentT, LoadDocumentT[keyof LoadDocumentT]][]).map(([key, value]) => renderField(key, value))}</div>
              <section className="border-t border-border pt-4">
                <div className="mb-3 flex items-center gap-2"><h3 className="text-sm font-semibold">Anomaly detection</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${issues.length ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{issues.length} {issues.length === 1 ? "flag" : "flags"}</span></div>
                {issues.length ? <div className="space-y-2">{issues.map((issue, index) => {
                  const rootField = issue.field.split(".")[0] as keyof LoadDocumentT;
                  const tone = issue.severity === "error" ? "border-rose-200 bg-rose-50/70 text-rose-800" : issue.severity === "warning" ? "border-amber-200 bg-amber-50/70 text-amber-900" : "border-blue-200 bg-blue-50/70 text-blue-900";
                  return <div key={`${issue.field}-${index}`} className={`flex items-start gap-3 rounded-lg border p-3 ${tone}`}><CircleAlert className="mt-0.5 h-4 w-4 shrink-0"/><div className="min-w-0 flex-1"><p className="text-xs font-semibold">{FIELD_META[rootField]?.label || issue.field}</p><p className="mt-1 text-xs leading-relaxed">{issue.message}</p></div><Button variant="outline" size="sm" className="h-7 shrink-0 px-2 text-[11px]" onClick={() => window.document.getElementById(`field-${rootField}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}>Review</Button></div>;
                })}</div> : <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-3 text-xs text-emerald-800"><CheckCircle2 className="h-4 w-4 shrink-0"/>No anomalies detected by the current validation rules.</div>}
                <p className="mt-2 text-[10px] text-muted-foreground">* Model-reported confidence estimates are not calibrated probabilities.</p>
              </section>
            </div> : <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 text-center"><FileText className="mb-3 h-8 w-8 text-muted-foreground/60"/><p className="text-sm font-medium">No extracted data</p><p className="mt-1 max-w-xs text-xs text-muted-foreground">Upload a supported PDF to extract structured freight fields.</p></div>}
          </div>
          <div className="rounded-xl border border-border bg-card p-4"><h2 className="text-sm font-semibold">Validation</h2>{extractState === "loading" ? <div className="mt-4 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">Validation will run after extraction.</div> : extractState === "error" ? <div className="mt-4 flex items-start gap-3 rounded-lg bg-rose-50 p-3"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600"/><div><p className="text-xs font-medium text-rose-800">Extraction unavailable</p><p className="mt-1 text-xs text-rose-700">{extractError}</p></div></div> : fields ? <><div className="mt-4 flex items-start gap-3 rounded-lg bg-emerald-50 p-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"/><div><p className="text-xs font-semibold text-emerald-800">{issues.filter((issue) => issue.severity === "error").length} errors · {issues.filter((issue) => issue.severity === "warning").length} warnings</p><p className="mt-1 text-xs leading-relaxed text-emerald-700">{issues.length ? "Review the flagged fields before approval." : "No validation issues found."}</p></div></div><div className="mt-4 max-h-[35vh] space-y-2 overflow-auto">{issues.length ? issues.map((issue, index) => <div key={`${issue.field}-${index}`} className="rounded-md border border-border p-2"><p className="text-[11px] font-semibold capitalize">{issue.severity} · {issue.field.replaceAll("_", " ")}</p><p className="mt-1 text-[11px] text-muted-foreground">{issue.message}</p></div>) : <p className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="h-3.5 w-3.5 text-emerald-600"/>All checks passed</p>}</div></> : <div className="mt-4 flex items-start gap-3 rounded-lg bg-muted/40 p-3"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"/><div><p className="text-xs font-medium">Awaiting extraction</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Validation results will appear here when extraction is available.</p></div></div>}<div className="mt-5 border-t border-border pt-4"><h3 className="text-xs font-semibold">TMS handoff</h3><p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Truck className="h-4 w-4 text-primary"/>Mock TMS · Demo mode</p></div></div>
        </section>
      </main>

      <footer className="shrink-0 border-t border-border bg-card px-4 py-3 lg:px-6"><div className="mx-auto grid max-w-screen-2xl gap-4 lg:grid-cols-[190px_minmax(180px,1fr)_auto]"><div className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2"><div className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-bold ${averageConfidence !== null ? "border-primary/30 text-primary" : "border-border text-muted-foreground"}`}>{averageConfidence === null ? "—" : `${averageConfidence}%`}</div><div><p className="text-xs font-semibold">Extraction confidence</p><p className="mt-0.5 text-xs text-muted-foreground">{extractState === "loading" ? "Extracting…" : averageConfidence !== null ? "Model estimate · not calibrated" : "Awaiting extraction"}</p></div></div><label className="min-w-0"><span className="mb-1 block text-xs font-semibold">Review notes</span><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add a broker note (optional)" className="min-h-11 resize-none" /></label><div className="flex flex-wrap items-end gap-2"><Button variant="outline" onClick={() => setMessage("Added to the broker review queue.")}><Send className="mr-2 h-4 w-4"/>Send to Review</Button><Button variant="outline" disabled={!fields} onClick={exportCsv}><Download className="mr-2 h-4 w-4"/>Export CSV</Button><Button disabled={!fields} onClick={() => setMessage("Mock TMS accepted the rate confirmation.")}><Truck className="mr-2 h-4 w-4"/>Send to Mock TMS</Button></div></div>{message && <p role="status" className="mx-auto mt-2 max-w-screen-2xl text-right text-xs text-emerald-700">{message}</p>}</footer>
    </div>
  );
}

function SampleRateConfirmation({ fields }: { fields: LoadDocumentT }) {
  const pickup = fields.stops.find((stop) => stop.type === "pickup");
  const delivery = fields.stops.find((stop) => stop.type === "delivery");
  return <article className="w-full max-w-[560px] border border-neutral-200 bg-white px-8 py-9 text-neutral-800 shadow-md sm:px-10"><div className="flex items-start justify-between border-b-2 border-neutral-800 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{fields.carrier_name}</p><p className="mt-1 text-lg font-bold">RATE CONFIRMATION</p></div><div className="text-right"><p className="text-[10px] text-neutral-500">LOAD NO.</p><p className="font-mono text-sm font-bold">{fields.load_number}</p></div></div><div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 text-xs"><SampleValue label="Carrier MC" value={fields.carrier_mc || "—"}/><SampleValue label="Broker" value={fields.broker_name || "—"}/><SampleValue label="Equipment" value={fields.equipment || "—"}/><SampleValue label="Weight" value={fields.weight_lbs ? `${fields.weight_lbs.toLocaleString()} lbs` : "—"}/><SampleValue label="Pickup" value={`${pickup?.city || "—"}, ${pickup?.state || ""} · ${pickup?.date || "—"}`}/><SampleValue label="Delivery" value={`${delivery?.city || "—"}, ${delivery?.state || ""} · ${delivery?.date || "—"}`}/></div><div className="mt-6 rounded bg-neutral-100 px-3 py-2 text-[10px] font-bold uppercase tracking-wider">Agreed rate</div><div className="mt-3 space-y-2 text-xs">{fields.line_items.map((item) => <div className="flex justify-between" key={item.description}><span>{item.description}</span><span>${item.amount.toLocaleString()}</span></div>)}<div className="flex justify-between border-t border-neutral-300 pt-2 font-bold"><span>Total rate ({fields.currency || "USD"})</span><span>{fields.total_rate === null ? "—" : `$${fields.total_rate.toLocaleString()}`}</span></div></div><p className="mt-8 border-t border-neutral-200 pt-3 text-[9px] leading-relaxed text-neutral-500">Demo sample for FreightIQ rate confirmation review. This document contains fictional shipment details.</p></article>;
}

function SampleValue({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><p className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500">{label}</p><p className="mt-1 font-medium">{value}</p></div>;
}
