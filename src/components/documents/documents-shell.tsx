"use client";

import { useCallback, useState } from "react";
import { useActiveOrg } from "@/components/providers/OrgProvider";
import { useDocumentProcessing } from "@/hooks/use-document-processing";
import { PdfUploadZone } from "./pdf-upload-zone";
import { ProcessingTracker } from "./processing-tracker";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DocumentReview, type ReviewDocument } from "./document-review";

const MAX_CONCURRENT_UPLOADS = 3;

export function DocumentsShell() {
  const { activeOrg, loading: orgLoading } = useActiveOrg();
  const orgId = activeOrg?.id ?? null;
  const { t } = useLanguage();

  const { trackedDocs } = useDocumentProcessing(orgId);
  
  const [reviewingDocument, setReviewingDocument] = useState<ReviewDocument | null>(null);

  const activeUploads = trackedDocs.filter(
    (d) => !["indexed", "error", "deleted"].includes(d.status)
  ).length;

  const handleUploadComplete = useCallback(
    (docId: string, filename: string, file: File) => {
      setReviewingDocument({ id: docId, filename, file, url: URL.createObjectURL(file) });
    },
    []
  );

  const handleCancel = useCallback(async (_docId: string) => {}, []);

  if (!orgLoading && !orgId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-sm">{t('knowledge.noOrg')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 w-full p-4 lg:p-8">
        <div className="max-w-400 mx-auto space-y-6">
          {/* Action Bar with Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-muted/30/80 border border-border/60 rounded-xl">
                <p className="text-sm font-bold text-neutral-700">
                  {t('knowledge.subtitle')}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
          {/* Upload zone */}
          <PdfUploadZone
            orgId={orgId ?? ""}
            disabled={orgLoading || activeUploads >= MAX_CONCURRENT_UPLOADS}
            onUploadComplete={handleUploadComplete}
          />

          {/* Processing tracker */}
          <ProcessingTracker
            trackedDocs={trackedDocs}
            onCancel={handleCancel}
          />

        </div>
      </div>
      </div>

      {reviewingDocument && <DocumentReview document={reviewingDocument} onClose={() => {
        if (reviewingDocument.url?.startsWith("blob:")) URL.revokeObjectURL(reviewingDocument.url);
        setReviewingDocument(null);
      }} />}
    </>
  );
}
