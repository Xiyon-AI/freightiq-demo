"use client";

import type { Document } from "@/lib/types/documents";

const DEMO_DOCUMENTS: Document[] = [
  {
    id: "demo-doc-1",
    organization_id: "demo-org",
    original_filename: "Product Overview.pdf",
    status: "indexed",
    created_at: "2026-10-24T09:30:00.000Z",
    updated_at: "2026-10-24T09:30:00.000Z",
  } as Document,
  {
    id: "demo-doc-2",
    organization_id: "demo-org",
    original_filename: "Customer Support Guide.pdf",
    status: "indexed",
    created_at: "2026-10-21T14:15:00.000Z",
    updated_at: "2026-10-21T14:15:00.000Z",
  } as Document,
];

export function useDocumentsList(_orgId: string | null) {
  return {
    documents: DEMO_DOCUMENTS,
    loading: false,
    error: null,
    refresh: async () => {},
  };
}
