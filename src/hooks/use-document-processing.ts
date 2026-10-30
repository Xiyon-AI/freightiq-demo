"use client";

import type { TrackedDocument } from "@/lib/types/documents";

export function useDocumentProcessing(_orgId: string | null) {
  return {
    trackedDocs: [] as TrackedDocument[],
    trackDocument: (_docId: string, _filename: string) => {},
    untrackDocument: (_docId: string) => {},
  };
}
