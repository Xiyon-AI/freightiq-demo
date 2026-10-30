"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { LoaderCircle } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export function PdfPreview({ file, filename }: { file: File; filename: string }) {
  const [data, setData] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    file.arrayBuffer().then((buffer) => {
      if (active) setData(buffer);
    }).catch(() => {
      if (active) setError("The uploaded file could not be read.");
    });
    return () => { active = false; };
  }, [file]);

  if (error) return <p role="alert" className="p-8 text-sm text-destructive">{error}</p>;
  if (!data) return <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin"/>Loading PDF…</div>;

  return <div className="flex min-h-full flex-col items-center gap-3">
    {pageCount > 0 && <div className="sticky top-0 z-10 flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
      <span className="font-medium">PDF page {pageNumber} of {pageCount}</span>
      <div className="flex items-center gap-2">
        <button type="button" className="rounded-md border border-border px-3 py-1.5 hover:bg-muted disabled:opacity-50" disabled={pageNumber <= 1} onClick={() => setPageNumber((page) => Math.max(1, page - 1))}>Previous</button>
        <button type="button" className="rounded-md border border-border px-3 py-1.5 hover:bg-muted disabled:opacity-50" disabled={pageNumber >= pageCount} onClick={() => setPageNumber((page) => Math.min(pageCount, page + 1))}>Next</button>
      </div>
    </div>}
    <Document
      file={{ data: new Uint8Array(data) }}
      onLoadSuccess={({ numPages }) => { setPageCount(numPages); setError(""); }}
      onLoadError={(loadError) => setError(loadError.message || "This PDF could not be rendered.")}
      loading={<div className="flex items-center gap-2 p-8 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin"/>Loading PDF…</div>}
      error={<p className="p-8 text-sm text-destructive">{filename} could not be rendered. Try uploading the original PDF again.</p>}
    >
      <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} className="shadow-sm" width={700}/>
    </Document>
  </div>;
}
