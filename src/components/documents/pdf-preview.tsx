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
  const [pageCount, setPageCount] = useState(1);
  const [pageNumber] = useState(1);
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
    {pageCount > 1 && <span className="text-[11px] text-muted-foreground">Page {pageNumber} of {pageCount}</span>}
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
