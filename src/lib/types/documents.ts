// ---------------------------------------------------------------------------
// Document & processing-event types — maps to SaaS DB tables
// ---------------------------------------------------------------------------

export type DocumentStatus =
  | "pending"
  | "processing"
  | "chunking"
  | "embedding"
  | "indexed"
  | "error"
  | "deleted";

export interface Document {
  id: string;
  organization_id: string;
  uploaded_by: string | null;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size_bytes: number | null;
  storage_path: string;
  storage_bucket: string;
  status: DocumentStatus;
  error_message: string | null;
  page_count: number | null;
  chunk_count: number | null;
  language: string | null;
  pinecone_namespace: string | null;
  pinecone_indexed_at: string | null;
  pinecone_vector_count: number | null;
  description: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DocumentProcessingEvent {
  id: string;
  document_id: string;
  organization_id: string;
  event_type: string;
  message: string | null;
  event_data: Record<string, unknown>;
  created_at: string;
}

// Pipeline steps for the processing tracker UI
export const PIPELINE_STEPS = [
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Extract" },
  { key: "chunking", label: "Chunk" },
  { key: "embedding", label: "Embed" },
  { key: "indexed", label: "Complete" },
] as const;

// Map RAG Plane status (uppercase) → SaaS DB status (lowercase)
export const RAG_TO_SAAS_STATUS: Record<string, DocumentStatus> = {
  PENDING: "pending",
  EXTRACTING_TEXT: "processing",
  CHUNKING: "chunking",
  UPSERTING: "embedding",
  COMPLETE: "indexed",
  FAILED: "error",
  CANCELLING: "deleted",
  CANCELLED: "deleted",
};

// UI display config for status badges
export const STATUS_CONFIG: Record<
  DocumentStatus,
  { label: string; color: string; animate?: boolean }
> = {
  pending: { label: "Pending", color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300" },
  processing: {
    label: "Extracting",
    color: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    animate: true,
  },
  chunking: {
    label: "Chunking",
    color: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    animate: true,
  },
  embedding: {
    label: "Embedding",
    color: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    animate: true,
  },
  indexed: { label: "Indexed", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  error: { label: "Failed", color: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" },
  deleted: { label: "Deleted", color: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400" },
};

// Client-side tracked doc for active processing
export interface TrackedDocument {
  docId: string;
  filename: string;
  status: DocumentStatus;
  events: DocumentProcessingEvent[];
  startedAt: string;
}
