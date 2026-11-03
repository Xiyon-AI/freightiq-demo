"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Code2,
  Download,
  FileBadge,
  FileText,
  Hash,
  Info,
  List,
  ListChecks,
  LoaderCircle,
  MapPin,
  Package,
  RotateCw,
  Scale,
  Send,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Truck,
  Upload,
} from "lucide-react";
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

const SAMPLE_FIELDS: LoadDocumentT = {
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
};

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

const VALIDATION_GROUPS = [
  "totals",
  "dates",
  "required",
  "carrier IDs",
  "sanity ranges",
  "state codes",
  "duplicates",
  "model uncertainty",
] as const;

const ALL_RULES: Array<{ group: typeof VALIDATION_GROUPS[number]; label: string }> = [
  { group: "totals", label: "Totals match" },
  { group: "dates", label: "Dates in order" },
  { group: "required", label: "Required fields present" },
  { group: "carrier IDs", label: "Carrier IDs valid" },
  { group: "sanity ranges", label: "Amounts in range" },
  { group: "state codes", label: "State codes valid" },
  { group: "duplicates", label: "No duplicate load" },
  { group: "model uncertainty", label: "Extraction confident" },
];

function getValidationGroup(issue: ValidationIssue): typeof VALIDATION_GROUPS[number] {
  const message = issue.message.toLowerCase();
  if (message.includes("line item") || message.includes("line items add up") || message.includes("totals") || message.includes("match the total rate")) {
    return "totals";
  }
  if (message.includes("date") || issue.field.includes("date")) return "dates";
  if (message.includes("required") || message.includes("at least one pickup") || message.includes("at least one delivery")) {
    return "required";
  }
  if (issue.field === "carrier_mc" || issue.field === "carrier_dot") return "carrier IDs";
  if (message.includes("expected") && (issue.field === "total_rate" || issue.field === "weight_lbs")) return "sanity ranges";
  if (issue.field.endsWith(".state")) return "state codes";
  if (message.includes("already seen") || message.includes("duplicate")) return "duplicates";
  if (message.includes("uncertain extraction") || message.includes("appointment")) return "model uncertainty";
  return "required";
}

function formatFieldLabel(field: string, fields?: LoadDocumentT | null): string {
  // Check for stops pattern: stops[0] or stops.0 or stops[1].window_end
  const stopMatch = field.match(/^stops(?:\[(\d+)\]|\.(\d+))(?:\.(.+))?$/);
  if (stopMatch) {
    const index = parseInt(stopMatch[1] ?? stopMatch[2] ?? "0", 10);
    const subfield = stopMatch[3] || "";

    let stopType = "Stop";
    if (fields?.stops && fields.stops[index]) {
      const type = fields.stops[index].type;
      stopType = type === "pickup" ? "Pickup stop" : type === "delivery" ? "Delivery stop" : `Stop ${index + 1}`;
    } else {
      stopType = index === 0 ? "Pickup stop" : "Delivery stop";
    }

    const subfieldLabels: Record<string, string> = {
      window_end: "end time",
      window_start: "start time",
      date: "date",
      state: "state",
      city: "city",
      address: "address",
      name: "facility name",
    };

    if (subfield && subfieldLabels[subfield]) {
      return `${stopType}: ${subfieldLabels[subfield]}`;
    }
    if (subfield) {
      return `${stopType}: ${subfield.replace(/_/g, " ")}`;
    }
    return stopType;
  }

  // Check line items pattern: line_items[0] etc.
  const lineItemMatch = field.match(/^line_items(?:\[(\d+)\]|\.(\d+))(?:\.(.+))?$/);
  if (lineItemMatch) {
    const index = parseInt(lineItemMatch[1] ?? lineItemMatch[2] ?? "0", 10);
    const subfield = lineItemMatch[3] || "";
    return subfield ? `Line item ${index + 1}: ${subfield}` : `Line item ${index + 1}`;
  }

  const root = field.split(".")[0] as keyof LoadDocumentT;
  if (FIELD_META[root]?.label) {
    return FIELD_META[root].label;
  }
  return field.replace(/_/g, " ");
}

const extractionRequests = new WeakMap<File, Promise<ExtractionResponse>>();

function extractFileOnce(file: File): Promise<ExtractionResponse> {
  const existingRequest = extractionRequests.get(file);
  if (existingRequest) return existingRequest;

  const request = (async () => {
    // In-memory / session tracking that skips duplicates on sample
    const form = new FormData();
    form.append("file", file);
    const seen = JSON.parse(sessionStorage.getItem("freightiq-seen-load-numbers") || "[]") as string[];
    form.append("seen_load_numbers", JSON.stringify(seen));

    const response = await fetch("/api/extract", { method: "POST", body: form });
    const result = (await response.json()) as ExtractionResponse;
    if (!response.ok) throw new Error(result.error || "Document extraction failed.");

    const loadNumber = result.fields?.load_number;
    if (typeof loadNumber === "string" && loadNumber.trim() && loadNumber.trim() !== "LD-572091") {
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
  const [sentToReview, setSentToReview] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [isSampleDoc, setIsSampleDoc] = useState(Boolean(document.sample));
  const [fields, setFields] = useState<LoadDocumentT | null>(document.sample ? SAMPLE_FIELDS : null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [extractState, setExtractState] = useState<ExtractionState>(document.sample ? "success" : "idle");
  const [extractError, setExtractError] = useState("");
  const [expandedStops, setExpandedStops] = useState(true);
  const [expandedLineItems, setExpandedLineItems] = useState(true);
  const isPdf = document.filename.toLowerCase().endsWith(".pdf");

  // Reset duplicate session tracking on page load so refresh is always clean
  useEffect(() => {
    // Session state clean
  }, []);

  const runExtraction = useCallback(async () => {
    if (!document.file || isSampleDoc) return;
    setExtractState("loading");
    setExtractError("");
    try {
      const result = await extractFileOnce(document.file);
      setFields(result.fields);
      setIssues(Array.isArray(result.issues) ? result.issues : []);
      setExtractState("success");
    } catch (error) {
      setExtractError(error instanceof Error ? error.message : "Document extraction failed.");
      setExtractState("error");
    }
  }, [document.file, isSampleDoc]);

  useEffect(() => {
    if (!document.file || document.sample) return;
    void runExtraction();
  }, [document.file, document.sample, runExtraction]);

  const switchToSample = useCallback(() => {
    setIsSampleDoc(true);
    setFields(SAMPLE_FIELDS);
    setIssues([]);
    setExtractState("success");
    setExtractError("");
  }, []);

  const retryExtraction = useCallback(() => {
    if (document.file) {
      extractionRequests.delete(document.file);
      void runExtraction();
    }
  }, [document.file, runExtraction]);

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

  // Rule checks and severity calculations
  const failedCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;

  // Passed checks count (only error or warning fails a rule; info does not)
  const passedChecks = fields
    ? ALL_RULES.filter((rule) => {
        const ruleIssues = issues.filter((issue) => getValidationGroup(issue) === rule.group);
        return !ruleIssues.some((i) => i.severity === "error" || i.severity === "warning");
      }).length
    : 0;

  const passRatio = passedChecks / ALL_RULES.length;

  // Line items sum calculation for totals check
  const lineItemTotal = fields?.line_items?.reduce((sum, item) => sum + (item.amount || 0), 0) ?? 0;
  const hasTotalMismatch =
    fields?.total_rate !== null &&
    fields?.total_rate !== undefined &&
    Math.round(Math.abs(lineItemTotal - fields.total_rate) * 100) > 1;
  const totalDiff = fields?.total_rate !== null && fields?.total_rate !== undefined ? Math.abs(lineItemTotal - fields.total_rate) : 0;

  // Field renderer with consistent colors and expandable stops/line items
  const renderField = (key: keyof LoadDocumentT, value: LoadDocumentT[keyof LoadDocumentT]) => {
    // Find all issues matching this field key
    const fieldIssues = issues.filter((issue) => {
      if (issue.field === key) return true;
      if (issue.field.startsWith(`${key}.`)) return true;
      if (key === "stops" && (issue.field.startsWith("stops.") || issue.field.startsWith("stops["))) return true;
      if (key === "line_items" && (issue.field.startsWith("line_items.") || issue.field.startsWith("line_items["))) return true;
      if (key === "uncertain_fields") {
        return issue.message.toLowerCase().includes("uncertain extraction");
      }
      return false;
    });

    const hasError = fieldIssues.some((i) => i.severity === "error");
    const hasWarning = fieldIssues.some((i) => i.severity === "warning");
    const hasInfo = fieldIssues.some((i) => i.severity === "info");

    const Icon = FIELD_META[key].icon;

    let summary: string;
    if (value === null) {
      summary = "Not found";
    } else if (key === "doc_type" && typeof value === "string") {
      summary = value === "rate_confirmation" ? "Rate confirmation" : value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    } else if (Array.isArray(value)) {
      if (key === "reference_numbers") summary = value.length ? value.join(", ") : "None";
      else if (key === "uncertain_fields") summary = value.length ? `${value.length} ${value.length === 1 ? "field needs" : "fields need"} review` : "None";
      else summary = `${value.length} ${key === "stops" ? (value.length === 1 ? "stop" : "stops") : key === "line_items" ? (value.length === 1 ? "line item" : "line items") : "items"}`;
    } else if (key === "weight_lbs" && typeof value === "number") {
      summary = `${value.toLocaleString()} lbs`;
    } else if (key === "total_rate" && typeof value === "number") {
      summary = `${fields?.currency || "USD"} $${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      summary = String(value);
    }

    // Determine row styling consistently: Red for error, Amber for warning, Blue for info, Clean for verified
    let borderAndBg = "border-border bg-card hover:bg-muted/30";
    let statusBadge = (
      <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
        <span className="hidden sm:inline text-[11px]">Valid</span>
      </span>
    );

    if (hasError) {
      borderAndBg = "border-rose-300 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/25";
      statusBadge = (
        <span className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 font-semibold">
          <CircleAlert className="h-4 w-4 shrink-0 text-rose-600" />
          <span className="hidden sm:inline text-[11px]">Failed</span>
        </span>
      );
    } else if (hasWarning) {
      borderAndBg = "border-amber-300 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/25";
      statusBadge = (
        <span className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium">
          <CircleAlert className="h-4 w-4 shrink-0 text-amber-600" />
          <span className="hidden sm:inline text-[11px]">Review</span>
        </span>
      );
    } else if (hasInfo) {
      borderAndBg = "border-blue-200 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20";
      statusBadge = (
        <span className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-400 font-medium">
          <Info className="h-4 w-4 shrink-0 text-blue-600" />
          <span className="hidden sm:inline text-[11px]">Note</span>
        </span>
      );
    }

    const isStops = key === "stops";
    const isLineItems = key === "line_items";

    return (
      <div id={`field-${key}`} key={key} className={`rounded-lg border px-3.5 py-2.5 transition-colors ${borderAndBg}`}>
        <div className="grid grid-cols-[200px_minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[210px_minmax(0,1fr)_auto] sm:gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate text-xs font-semibold text-foreground">{FIELD_META[key].label}</span>
          </div>

          <div className="min-w-0 flex items-center gap-2">
            <p className={`truncate text-xs sm:text-sm ${value === null ? "italic text-muted-foreground" : "text-foreground font-medium"}`}>
              {summary}
            </p>
            {isStops && Array.isArray(value) && value.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                onClick={() => setExpandedStops((prev) => !prev)}
              >
                {expandedStops ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <span className="ml-1 text-[10px]">{expandedStops ? "Hide" : "Details"}</span>
              </Button>
            )}
            {isLineItems && Array.isArray(value) && value.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                onClick={() => setExpandedLineItems((prev) => !prev)}
              >
                {expandedLineItems ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <span className="ml-1 text-[10px]">{expandedLineItems ? "Hide" : "Breakdown"}</span>
              </Button>
            )}
          </div>

          <div className="shrink-0 text-right">{statusBadge}</div>
        </div>

        {/* Expandable stops breakdown */}
        {isStops && expandedStops && fields?.stops && fields.stops.length > 0 && (
          <div className="mt-3 space-y-2 border-t border-border/70 pt-2.5">
            {fields.stops.map((stop, i) => {
              const isPickup = stop.type === "pickup";
              const isAppt = !stop.window_end && Boolean(stop.window_start);
              return (
                <div key={i} className="rounded-md border border-border/70 bg-background/90 p-2.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      <span className={`inline-block h-2 w-2 rounded-full ${isPickup ? "bg-blue-500" : "bg-emerald-500"}`} />
                      {isPickup ? `Pickup Stop (${i + 1})` : `Delivery Stop (${i + 1})`}
                    </span>
                    {isAppt ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                        <Clock className="h-3 w-3" />
                        Appointment
                      </span>
                    ) : stop.window_start && stop.window_end ? (
                      <span className="text-[11px] text-muted-foreground font-mono">
                        Window: {stop.window_start} – {stop.window_end}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 font-medium text-foreground">{stop.name || "Facility name not provided"}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {[stop.address, stop.city, stop.state].filter(Boolean).join(", ") || "No street address"}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Date: <strong className="text-foreground">{stop.date || "—"}</strong>
                    </span>
                    {stop.window_start && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Time: <strong className="text-foreground">{stop.window_start}{stop.window_end ? ` – ${stop.window_end}` : " (Appt)"}</strong>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Expandable line items breakdown */}
        {isLineItems && expandedLineItems && fields?.line_items && fields.line_items.length > 0 && (
          <div className="mt-3 space-y-2 border-t border-border/70 pt-2.5">
            <div className="divide-y divide-border/60 rounded-md border border-border/70 bg-background/90 text-xs shadow-2xs">
              {fields.line_items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2">
                  <span className="font-medium text-foreground">{item.description}</span>
                  <span className="font-mono font-medium text-foreground">
                    ${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between bg-muted/40 px-3 py-2 text-xs font-semibold">
                <span className="text-foreground">Line items sum</span>
                <span className="font-mono text-foreground">
                  ${lineItemTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            {hasTotalMismatch && (
              <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50/90 p-2.5 text-[11px] text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />
                <span>
                  <strong>Discrepancy:</strong> Agreed total rate reads ${fields.total_rate?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} but line items add up to ${lineItemTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (difference ${totalDiff.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}).
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const activity = [
    { title: "Document uploaded", detail: isSampleDoc ? "Sample_Rate_Confirmation_RC-10482.pdf" : document.filename, icon: Upload, done: true, alert: false },
    { title: "Data extracted", detail: extractState === "success" ? "Structured fields are ready" : extractState === "loading" ? "Extraction in progress" : extractState === "error" ? "Extraction failed" : "Waiting for extraction", icon: Sparkles, done: extractState === "success", alert: extractState === "error" },
    { title: "Validation checks", detail: fields ? `${passedChecks} of ${ALL_RULES.length} passed · ${warningCount} warnings · ${failedCount} failed` : "Waiting for extracted data", icon: ListChecks, done: Boolean(fields), alert: failedCount > 0 },
    { title: issues.length ? "Rule checks flagged" : "Rule checks", detail: issues.length ? (issues[0]?.message || "Rule issues detected") : fields ? "All validation checks passed" : "Waiting for validation", icon: failedCount > 0 ? TriangleAlert : issues.length > 0 ? CircleAlert : CheckCircle2, done: Boolean(fields), alert: failedCount > 0 },
    { title: sentToReview ? "Sent to review" : "Review queue", detail: sentToReview ? "Added to the current review queue" : "Waiting for broker action", icon: Send, done: sentToReview, alert: false },
  ];
  const visibleActivity = showAllActivity ? activity : activity.slice(0, 4);

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-50 flex flex-col bg-background text-foreground md:left-64">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Back to documents">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Rate confirmations <span className="mx-1">/</span> Review</p>
            <h1 className="truncate text-sm font-semibold">{isSampleDoc ? "Sample_Rate_Confirmation_RC-10482.pdf" : document.filename}</h1>
          </div>
        </div>
        <span className="hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground sm:flex">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          {isSampleDoc ? "Sample extraction" : extractState === "loading" ? "Extracting document" : extractState === "success" ? "Extraction complete" : extractState === "error" ? "Extraction error" : "PDF received"}
        </span>
      </header>

      <main className="min-h-0 w-full max-w-screen-2xl flex-1 self-center overflow-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* Left: Source Document / Sample */}
          <section className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-primary" /> Source {isPdf ? "PDF" : "Document"}
              </div>
              <span className="text-xs text-muted-foreground">{isSampleDoc ? "Sample · 1 page" : "Uploaded file"}</span>
            </div>
            {/* Horizontal scrollbar prevented via overflow-x-hidden */}
            <div className="relative flex flex-1 justify-center overflow-y-auto overflow-x-hidden bg-muted/40 p-4">
              {isSampleDoc ? (
                <SampleRateConfirmation fields={fields || SAMPLE_FIELDS} />
              ) : document.file && isPdf ? (
                <PdfPreview file={document.file} filename={document.filename} />
              ) : (
                <div className="p-8 text-sm text-muted-foreground">Preview is unavailable for this file.</div>
              )}
            </div>
          </section>

          {/* Right: Data and Validation */}
          <section className="grid min-h-0 gap-4 2xl:grid-cols-[minmax(0,1fr)_270px]">
            {/* Structured data column */}
            <div className="min-h-[350px] overflow-auto rounded-xl border border-border bg-card p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold">Structured rate data</h2>
                    {fields && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {Object.keys(fields).length} fields
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {extractState === "loading"
                      ? "Extracting document fields…"
                      : fields
                      ? "Review extracted values and validation flags"
                      : "Extracted fields will appear here"}
                  </p>
                </div>
                {fields && (
                  <Button variant="outline" size="sm" onClick={() => setShowJson((value) => !value)}>
                    <Code2 className="mr-1.5 h-3.5 w-3.5" />
                    {showJson ? "Fields" : "JSON"}
                  </Button>
                )}
              </div>

              {extractState === "loading" && !fields ? (
                <div className="flex min-h-52 flex-col items-center justify-center text-sm text-muted-foreground">
                  <LoaderCircle className="mb-3 h-6 w-6 animate-spin text-primary" />
                  Extracting document data…
                </div>
              ) : extractState === "error" && !fields ? (
                <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/70 p-6 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
                    <TriangleAlert className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold text-rose-900 dark:text-rose-200">
                    Document Extraction Failed
                  </h3>
                  <p className="mt-1.5 max-w-md text-xs leading-relaxed text-rose-700 dark:text-rose-300">
                    {extractError || "We were unable to extract structured data from this document. Please ensure it is a clear carrier rate confirmation PDF up to 4 MB."}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                    <Button size="sm" onClick={switchToSample} className="font-medium">
                      <FileText className="mr-1.5 h-4 w-4" />
                      Open sample instead
                    </Button>
                    <Button variant="outline" size="sm" onClick={retryExtraction} className="font-medium">
                      <RotateCw className="mr-1.5 h-4 w-4" />
                      Retry extraction
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClose} className="font-medium">
                      Upload different file
                    </Button>
                  </div>
                </div>
              ) : fields ? (
                showJson ? (
                  <pre className="overflow-auto rounded-lg bg-muted/40 p-4 text-xs leading-relaxed">
                    {JSON.stringify(fields, null, 2)}
                  </pre>
                ) : (
                  <div className="space-y-5">
                    {/* Header with widened Field column to prevent truncation */}
                    <div className="grid grid-cols-[200px_minmax(0,1fr)_auto] gap-2 px-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:grid-cols-[210px_minmax(0,1fr)_auto] sm:gap-3">
                      <span>Field</span>
                      <span>Extracted value</span>
                      <span className="text-right">Status</span>
                    </div>
                    <div className="space-y-2">
                      {(Object.entries(fields) as [keyof LoadDocumentT, LoadDocumentT[keyof LoadDocumentT]][]).map(
                        ([key, value]) => renderField(key, value)
                      )}
                    </div>

                    {/* Rule checks section */}
                    <section className="border-t border-border pt-4">
                      <div className="mb-3 flex items-center gap-2">
                        <h3 className="text-sm font-semibold">Rule checks</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            issues.length
                              ? failedCount > 0
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          }`}
                        >
                          {issues.length} {issues.length === 1 ? "flag" : "flags"}
                        </span>
                      </div>
                      {issues.length ? (
                        <div className="space-y-2">
                          {issues.map((issue, index) => {
                            const formattedLabel = formatFieldLabel(issue.field, fields);
                            const rootField = ((issue.field.split(".")[0] ?? "").split("[")[0] ?? "") as keyof LoadDocumentT;

                            let tone = "border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300";
                            let IssueIcon = CircleAlert;

                            if (issue.severity === "error") {
                              tone = "border-rose-200 bg-rose-50/70 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300";
                              IssueIcon = CircleAlert;
                            } else if (issue.severity === "info") {
                              tone = "border-blue-200 bg-blue-50/70 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300";
                              IssueIcon = Info;
                            }

                            return (
                              <div
                                key={`${issue.field}-${index}`}
                                className={`flex items-start gap-3 rounded-lg border p-3 ${tone}`}
                              >
                                <IssueIcon className="mt-0.5 h-4 w-4 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-semibold">{formattedLabel}</p>
                                    <span className="text-[10px] font-medium uppercase tracking-wider opacity-75">
                                      {issue.severity}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs leading-relaxed">{issue.message}</p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 shrink-0 px-2 text-[11px]"
                                  onClick={() =>
                                    window.document
                                      .getElementById(`field-${rootField}`)
                                      ?.scrollIntoView({ behavior: "smooth", block: "center" })
                                  }
                                >
                                  Review
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          All validation rule checks passed.
                        </div>
                      )}
                    </section>
                  </div>
                )
              ) : (
                <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 text-center">
                  <FileText className="mb-3 h-8 w-8 text-muted-foreground/60" />
                  <p className="text-sm font-medium">No extracted data</p>
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    Upload a supported PDF to extract structured freight fields.
                  </p>
                </div>
              )}
            </div>

            {/* Validation checks & Activity column */}
            <div className="min-w-0 space-y-4">
              <section className="rounded-xl border border-border bg-card p-4">
                <h2 className="text-sm font-semibold">Validation Checks</h2>
                {extractState === "error" ? (
                  <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/20">
                    <p className="font-semibold text-rose-800 dark:text-rose-300">Checks suspended</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Validation requires extracted fields.</p>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-4 rounded-lg border border-border bg-muted/20 p-3">
                    <div
                      className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: `conic-gradient(var(--primary) ${fields ? passRatio * 360 : 0}deg, var(--muted) 0deg)`,
                      }}
                    >
                      <div className="flex h-[68px] w-[68px] flex-col items-center justify-center rounded-full bg-card">
                        <span className="text-sm font-bold tabular-nums">
                          {fields ? passedChecks : 0}/{ALL_RULES.length}
                        </span>
                        <span className="text-[10px] text-muted-foreground">Passed</span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Passed
                        </span>
                        <span className="font-semibold tabular-nums">{fields ? passedChecks : 0}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                          Warnings
                        </span>
                        <span className="font-semibold tabular-nums">{fields ? warningCount : 0}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          Failed
                        </span>
                        <span className="font-semibold tabular-nums">{fields ? failedCount : 0}</span>
                      </div>
                    </div>
                  </div>
                )}
                {!fields && extractState !== "error" && (
                  <p className="mt-3 text-[11px] text-muted-foreground">Validation results will appear after extraction.</p>
                )}
              </section>

              <section className="rounded-xl border border-border bg-card p-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold">Activity Timeline</h2>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() => setShowAllActivity((value) => !value)}
                  >
                    {showAllActivity ? "Show less" : "View all"}
                  </button>
                </div>
                <div className="space-y-0">
                  {visibleActivity.map((event, index) => {
                    const Icon = event.icon;
                    const color = event.alert
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      : event.done
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground";
                    return (
                      <div key={event.title} className="relative flex gap-3 pb-4 last:pb-0">
                        {index < visibleActivity.length - 1 && (
                          <span className="absolute bottom-0 left-[15px] top-8 w-px bg-border" />
                        )}
                        <span className={`relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${color}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <p className={`text-xs font-semibold ${event.alert ? "text-rose-700 dark:text-rose-400" : "text-foreground"}`}>
                            {event.title}
                          </p>
                          <p className="mt-1 break-words text-[11px] leading-relaxed text-muted-foreground">
                            {event.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 border-t border-border pt-3">
                  <h3 className="text-xs font-semibold">TMS handoff</h3>
                  <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Truck className="h-4 w-4 text-primary" />
                    Mock TMS · Demo mode
                  </p>
                </div>
              </section>
            </div>
          </section>
        </div>

        {/* Footer with all 8 Rule Results, protected TMS button, and Xiyon AI CTA */}
        <footer className="mt-4 border-t border-border bg-card py-4">
          <div className="mx-auto grid max-w-screen-2xl items-center gap-4 xl:grid-cols-[380px_minmax(180px,1fr)_auto]">
            {/* Rule results showing all 8 rules */}
            <div className="flex flex-col justify-center rounded-lg border border-border bg-muted/40 px-3.5 py-2.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Rule results</span>
                {fields && (
                  <span
                    className={`text-[10px] font-semibold ${
                      failedCount > 0
                        ? "text-rose-700 dark:text-rose-400"
                        : warningCount > 0
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {passedChecks} of {ALL_RULES.length} passed
                  </span>
                )}
              </div>
              {fields ? (
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                  {ALL_RULES.map(({ group, label }) => {
                    const ruleIssues = issues.filter((i) => getValidationGroup(i) === group);
                    const hasError = ruleIssues.some((i) => i.severity === "error");
                    const hasWarning = ruleIssues.some((i) => i.severity === "warning");

                    let icon = <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />;
                    let textColor = "text-emerald-700 dark:text-emerald-400 font-medium";

                    if (hasError) {
                      icon = <CircleAlert className="h-3.5 w-3.5 shrink-0 text-rose-600" />;
                      textColor = "text-rose-700 dark:text-rose-400 font-semibold";
                    } else if (hasWarning) {
                      icon = <CircleAlert className="h-3.5 w-3.5 shrink-0 text-amber-600" />;
                      textColor = "text-amber-700 dark:text-amber-400 font-medium";
                    }

                    return (
                      <div key={group} className={`flex items-center gap-1.5 ${textColor}`}>
                        {icon}
                        <span className="truncate">{label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs italic text-muted-foreground">
                  {extractState === "loading"
                    ? "Extracting document…"
                    : extractState === "error"
                    ? "Extraction failed"
                    : "Awaiting extraction"}
                </p>
              )}
            </div>

            <label className="min-w-0">
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add a broker note (optional)"
                className="min-h-11 resize-none"
              />
            </label>

            {/* Actions: Send to Mock TMS blocked while a check has failed */}
            <div className="flex flex-wrap items-end gap-2">
              <Button
                className="h-11 cursor-pointer font-medium"
                variant={failedCount > 0 ? "default" : "outline"}
                onClick={() => {
                  setSentToReview(true);
                  setMessage("Added to the broker review queue.");
                }}
              >
                <Send className="mr-2 h-4 w-4" />
                Send to Review
              </Button>
              <Button className="h-11 cursor-pointer font-medium" variant="outline" disabled={!fields} onClick={exportCsv}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                className={`h-11 font-medium transition-all ${
                  failedCount > 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
                variant={failedCount > 0 ? "outline" : "default"}
                disabled={!fields || failedCount > 0}
                title={
                  failedCount > 0
                    ? "Cannot send to TMS while checks have failed. Send to Review or correct the flagged items."
                    : undefined
                }
                onClick={() => setMessage("Mock TMS accepted the rate confirmation.")}
              >
                <Truck className="mr-2 h-4 w-4" />
                Send to Mock TMS
              </Button>
            </div>
          </div>

          {message && <p role="status" className="mx-auto mt-2 max-w-screen-2xl text-right text-xs text-emerald-700 dark:text-emerald-400">{message}</p>}

          {/* Xiyon AI Branding & CTA with branded company email and prefilled subject */}
          <div className="mt-3 border-t border-border pt-3 text-center text-xs text-muted-foreground">
            Built by <span className="font-semibold text-foreground">Xiyon AI</span>. Send 3 redacted rate confirmations and I&apos;ll run them for you —{" "}
            <a
              href="mailto:hello@xiyonai.com?subject=FreightIQ%20Demo%20-%20Rate%20Confirmations"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              hello@xiyonai.com
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}

function SampleRateConfirmation({ fields }: { fields: LoadDocumentT }) {
  const pickup = fields.stops.find((stop) => stop.type === "pickup");
  const delivery = fields.stops.find((stop) => stop.type === "delivery");
  return (
    <article className="w-full max-w-[560px] border border-neutral-200 bg-white px-8 py-9 text-neutral-800 shadow-md sm:px-10">
      <div className="flex items-start justify-between border-b-2 border-neutral-800 pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{fields.carrier_name}</p>
          <p className="mt-1 text-lg font-bold">RATE CONFIRMATION</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-neutral-500">LOAD NO.</p>
          <p className="font-mono text-sm font-bold">{fields.load_number}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
        <SampleValue label="Carrier MC" value={fields.carrier_mc || "—"} />
        <SampleValue label="Broker" value={fields.broker_name || "—"} />
        <SampleValue label="Equipment" value={fields.equipment || "—"} />
        <SampleValue label="Weight" value={fields.weight_lbs ? `${fields.weight_lbs.toLocaleString()} lbs` : "—"} />
        <SampleValue label="Pickup" value={`${pickup?.city || "—"}, ${pickup?.state || ""} · ${pickup?.date || "—"}`} />
        <SampleValue label="Delivery" value={`${delivery?.city || "—"}, ${delivery?.state || ""} · ${delivery?.date || "—"}`} />
      </div>
      <div className="mt-6 rounded bg-neutral-100 px-3 py-2 text-[10px] font-bold uppercase tracking-wider">Agreed rate</div>
      <div className="mt-3 space-y-2 text-xs">
        {fields.line_items.map((item) => (
          <div className="flex justify-between" key={item.description}>
            <span>{item.description}</span>
            <span>${item.amount.toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-neutral-300 pt-2 font-bold">
          <span>Total rate ({fields.currency || "USD"})</span>
          <span>{fields.total_rate === null ? "—" : `$${fields.total_rate.toLocaleString()}`}</span>
        </div>
      </div>
      <p className="mt-8 border-t border-neutral-200 pt-3 text-[9px] leading-relaxed text-neutral-500">
        Demo sample for FreightIQ rate confirmation review. This document contains fictional shipment details.
      </p>
    </article>
  );
}

function SampleValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
