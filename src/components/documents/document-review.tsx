"use client";

import { useState } from "react";
import { ArrowLeft, Check, CheckCircle2, CircleAlert, FileText, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface ReviewDocument {
  id: string;
  filename: string;
  url?: string;
  file?: File;
}

export function DocumentReview({ document, onClose }: { document: ReviewDocument; onClose: () => void }) {
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const isPdf = document.filename.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Back to documents"><ArrowLeft className="h-4 w-4" /></Button>
          <div className="min-w-0"><p className="text-xs text-muted-foreground">Documents <span className="mx-1">/</span> Review</p><h1 className="truncate text-sm font-semibold">{document.filename}</h1></div>
        </div>
        <span className="hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground sm:flex"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Document analysis</span>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:p-6">
        <section className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3"><div className="flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4 text-primary" /> Source document</div><span className="text-xs text-muted-foreground">Preview</span></div>
          <div className="flex flex-1 items-center justify-center overflow-auto bg-muted/40 p-4">
            {document.url && isPdf ? <iframe title={`Preview of ${document.filename}`} src={document.url} className="h-full min-h-[480px] w-full rounded-md bg-white" /> : document.url && document.filename.match(/\.(txt|md|html)$/i) ? <iframe title={`Preview of ${document.filename}`} src={document.url} className="h-full min-h-[480px] w-full rounded-md border bg-white" /> : <div className="max-w-sm rounded-xl border border-border bg-card p-8 text-center"><FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground"/><p className="text-sm font-medium">{document.url ? "Preview is not available for this file type" : "Source preview unavailable"}</p><p className="mt-1 text-xs text-muted-foreground">{document.url ? "The file is ready for review." : "This document record has no stored file URL."}</p></div>}
          </div>
        </section>

        <section className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_250px]">
          <div className="min-h-[350px] overflow-auto rounded-xl border border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-semibold">Extracted data</h2><p className="mt-1 text-xs text-muted-foreground">Review fields detected in this document</p></div><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">0 fields</span></div>
            <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 text-center"><FileText className="mb-3 h-8 w-8 text-muted-foreground/60"/><p className="text-sm font-medium">No extracted fields yet</p><p className="mt-1 max-w-xs text-xs text-muted-foreground">Extracted values and confidence scores will appear here when document analysis is available.</p></div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4"><h2 className="text-sm font-semibold">Validation checks</h2><div className="mt-4 flex items-start gap-3 rounded-lg bg-muted/40 p-3"><CircleAlert className="mt-0.5 h-4 w-4 text-amber-600"/><div><p className="text-xs font-medium">Analysis pending</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">No validation results are available for this document yet.</p></div></div><div className="mt-5 border-t border-border pt-4"><h3 className="text-xs font-semibold">Review status</h3><p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-emerald-600"/> Ready for manual review</p></div></div>
        </section>
      </main>

      <footer className="shrink-0 border-t border-border bg-card px-4 py-3 lg:px-6"><div className="mx-auto grid max-w-screen-2xl gap-4 lg:grid-cols-[190px_minmax(180px,1fr)_auto]"><div className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2"><div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary/30 text-sm font-bold text-primary">—</div><div><p className="text-xs font-semibold">Confidence score</p><p className="mt-0.5 text-xs text-muted-foreground">Awaiting analysis</p></div></div><label className="min-w-0"><span className="mb-1 block text-xs font-semibold">Review notes</span><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add an internal note (optional)" className="min-h-11 resize-none" /></label><div className="flex flex-wrap items-end gap-2"><Button variant="outline" onClick={() => setMessage("Document sent to review.")}><Send className="mr-2 h-4 w-4"/>Send to Review</Button><Button onClick={() => setMessage("Document approved for export.")}><Check className="mr-2 h-4 w-4"/>Approve &amp; Export</Button></div></div>{message && <p role="status" className="mx-auto mt-2 max-w-screen-2xl text-right text-xs text-emerald-700">{message}</p>}</footer>
    </div>
  );
}
