"use client";

import { useCallback, useState } from "react";
import { FileCheck2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PdfUploadZone } from "./pdf-upload-zone";
import { DocumentReview, type ReviewDocument } from "./document-review";

export function DocumentsShell() {
  const [reviewingDocument, setReviewingDocument] = useState<ReviewDocument | null>(null);

  const handleUploadComplete = useCallback(
    (docId: string, filename: string, file: File) => {
      setReviewingDocument({ id: docId, filename, file, url: URL.createObjectURL(file) });
    },
    []
  );

  const openSample = useCallback(() => {
    setReviewingDocument({ id: "sample-rate-confirmation", filename: "Sample_Rate_Confirmation_RC-10482.pdf", sample: true });
  }, []);

  return (
    <>
      <div className="flex-1 w-full p-4 lg:p-8">
        <div className="max-w-400 mx-auto space-y-6">
          {/* Action Bar with Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-muted/30/80 border border-border/60 rounded-xl">
                <p className="text-sm font-bold text-neutral-700">Carrier rate confirmation intake</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
          {/* Upload zone */}
          <PdfUploadZone
            onUploadComplete={handleUploadComplete}
          />

          <div className="flex flex-col justify-between gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3"><div className="mt-0.5 text-primary"><FileCheck2 className="h-4 w-4" /></div><div><p className="text-sm font-semibold text-foreground">Try the sample rate confirmation</p><p className="mt-1 text-xs text-muted-foreground">Preview the extraction, validation, CSV export, and mock TMS handoff using demo data.</p></div></div>
            <Button variant="outline" onClick={openSample}><FileText className="mr-2 h-4 w-4" />Open sample</Button>
          </div>

          {/* Xiyon AI CTA */}
          <div className="mt-2 rounded-xl border border-border bg-card p-5 text-center text-sm shadow-xs">
            <span className="font-semibold text-foreground">Built by Xiyon AI.</span>{" "}
            <span className="text-muted-foreground">Send 3 redacted rate confirmations and I&apos;ll run them for you —</span>{" "}
            <a
              href="mailto:hello@xiyonai.com?subject=FreightIQ%20Demo%20-%20Rate%20Confirmations"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              hello@xiyonai.com
            </a>
          </div>
        </div>
      </div>
      </div>

      {reviewingDocument && <DocumentReview key={reviewingDocument.id} document={reviewingDocument} onClose={() => {
        if (reviewingDocument.url?.startsWith("blob:")) URL.revokeObjectURL(reviewingDocument.url);
        setReviewingDocument(null);
      }} />}
    </>
  );
}
