"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Trash2,
  Search,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Cog,
  Scissors,
  DatabaseZap,
  Clock,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Document, DocumentStatus } from "@/lib/types/documents";
import { STATUS_CONFIG } from "@/lib/types/documents";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentLibraryProps {
  documents: Document[];
  loading: boolean;
  onDelete: (docId: string) => void;
  onDownload: (docId: string) => void;
  onView: (docId: string) => void;
}

type SortKey = "original_filename" | "status" | "page_count" | "created_at";

const STATUS_ICONS: Partial<Record<DocumentStatus, React.ReactNode>> = {
  pending: <Clock className="w-3.5 h-3.5" />,
  processing: <Cog className="w-3.5 h-3.5 animate-spin" />,
  chunking: <Scissors className="w-3.5 h-3.5 animate-spin" />,
  embedding: <DatabaseZap className="w-3.5 h-3.5 animate-spin" />,
  indexed: <CheckCircle2 className="w-3.5 h-3.5" />,
  error: <AlertCircle className="w-3.5 h-3.5" />,
};

export function DocumentLibrary({
  documents,
  loading,
  onDelete,
  onDownload,
  onView,
}: DocumentLibraryProps) {
  const { t, locale } = useLanguage();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "original_filename");
    }
  };

  const filtered = useMemo(() => {
    let list = documents;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.original_filename.toLowerCase().includes(q) ||
          d.filename.toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [documents, search, sortKey, sortAsc]);

  // ─── Loading skeletons ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Skeleton className="w-full h-[42px] rounded-xl" />
        </div>

        {/* Desktop table skeleton */}
        <div className="hidden lg:block overflow-hidden rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                <th className="text-left px-4 py-3 font-medium">{t('knowledge.name')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('knowledge.status')}</th>
                <th className="text-right px-4 py-3 font-medium">{t('knowledge.pages')}</th>
                <th className="text-right px-4 py-3 font-medium">{t('knowledge.chunks')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('knowledge.created')}</th>
                <th className="text-right px-4 py-3 font-medium">{t('knowledge.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                      <div className="space-y-2 w-full max-w-[240px]">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="px-4 py-3.5 text-right"><Skeleton className="h-4 w-8 ml-auto" /></td>
                  <td className="px-4 py-3.5 text-right"><Skeleton className="h-4 w-8 ml-auto" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex justify-end gap-2">
                       <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card skeleton */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="text-center space-y-2">
                <Skeleton className="h-3 w-10 mx-auto rounded" />
                <Skeleton className="h-4 w-3/4 mx-auto rounded" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="text-center space-y-2">
                    <Skeleton className="h-3 w-12 mx-auto rounded" />
                    <Skeleton className="h-6 w-8 mx-auto rounded" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-5">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-9 w-9 rounded-full" />
                ))}
              </div>
              <div className="pt-3 border-t border-border/50">
                <Skeleton className="h-3 w-32 mx-auto rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder={t('knowledge.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">
            {documents.length === 0
              ? t('knowledge.noDocs')
              : "No documents match your search."}
          </p>
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════════════════════
              DESKTOP: Table view (lg+)
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="hidden lg:block overflow-hidden rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">
                    <button
                      className="flex items-center gap-1 hover:text-foreground"
                      onClick={() => toggleSort("original_filename")}
                    >
                      {t('knowledge.name')} <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium">
                    <button
                      className="flex items-center gap-1 hover:text-foreground"
                      onClick={() => toggleSort("status")}
                    >
                      {t('knowledge.status')} <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    <button
                      className="flex items-center gap-1 justify-end hover:text-foreground"
                      onClick={() => toggleSort("page_count")}
                    >
                      {t('knowledge.pages')} <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 font-medium">{t('knowledge.chunks')}</th>
                  <th className="text-left px-4 py-3 font-medium">
                    <button
                      className="flex items-center gap-1 hover:text-foreground"
                      onClick={() => toggleSort("created_at")}
                    >
                      {t('knowledge.created')} <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 font-medium">{t('knowledge.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((doc) => {
                  const cfg = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.pending;
                  const isActive = !["indexed", "error", "deleted"].includes(doc.status);
                  const isDeleting = deleting === doc.id;

                  return (
                    <tr
                      key={doc.id}
                      className={`transition-colors ${
                        isDeleting
                          ? "bg-muted/30 opacity-60"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      {/* Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[240px]">
                              {doc.original_filename}
                            </p>
                            {doc.file_size_bytes && (
                              <p className="text-xs text-neutral-400">
                                {formatBytes(doc.file_size_bytes)}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}
                        >
                          {STATUS_ICONS[doc.status]}
                          {t(`common.${doc.status}`)}
                          {isActive && cfg.animate && (
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-40" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Pages */}
                      <td className="px-4 py-3.5 text-right text-muted-foreground">
                        {doc.page_count ?? "—"}
                      </td>

                      {/* Chunks */}
                      <td className="px-4 py-3.5 text-right text-muted-foreground">
                        {doc.chunk_count ?? "—"}
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3.5 text-neutral-500 text-xs">
                        {formatDate(doc.created_at, locale)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {doc.status === "indexed" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-sm font-medium"
                                onClick={() => onView(doc.id)}
                              >
                                View
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem
                                    onClick={() => onDownload(doc.id)}
                                    className="cursor-pointer"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setDeleteConfirm(doc.id)}
                                    className="cursor-pointer text-error focus:text-error"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          )}

                          {isDeleting && (
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{t('common.deleting')}</span>
                            </div>
                          )}

                          {deleteConfirm === doc.id && !isDeleting && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-error hover:bg-error-light"
                                onClick={async () => {
                                  setDeleting(doc.id);
                                  await onDelete(doc.id);
                                  setDeleting(null);
                                  setDeleteConfirm(null);
                                }}
                              >
                                {t('account.confirm')}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-neutral-500"
                                onClick={() => setDeleteConfirm(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              MOBILE: Card view (below lg)
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((doc) => {
              const cfg = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.pending;
              const isActive = !["indexed", "error", "deleted"].includes(doc.status);
              const isDeleting = deleting === doc.id;
              const isConfirming = deleteConfirm === doc.id && !isDeleting;

              return (
                <div
                  key={doc.id}
                  className={`
                    group relative rounded-2xl border border-border bg-card
                    shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden
                    ${isDeleting ? "opacity-50 scale-[0.98]" : "hover:border-accent/30"}
                  `}
                >
                  {/* Delete confirmation overlay */}
                  {isConfirming && (
                    <div className="absolute inset-0 z-10 bg-card/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 rounded-2xl">
                      <Trash2 className="w-6 h-6 text-error" />
                      <p className="text-sm font-medium text-foreground">Delete this document?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            setDeleting(doc.id);
                            await onDelete(doc.id);
                            setDeleting(null);
                            setDeleteConfirm(null);
                          }}
                          className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-error text-white hover:bg-error/90 transition-colors"
                        >
                          {t('account.confirm')}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Deleting spinner overlay */}
                  {isDeleting && (
                    <div className="absolute inset-0 z-10 bg-card/90 flex items-center justify-center rounded-2xl">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  <div className="p-5 space-y-4">
                    {/* Filename */}
                    <div className="flex items-start gap-3 text-left">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center mt-2.5">
                        <p className="text-base font-medium text-foreground truncate" title={doc.original_filename}>
                          {doc.original_filename}
                        </p>
                      </div>
                    </div>

                    {/* Stats row: Chunks / Status / Pages */}
                    <div className="grid grid-cols-3 gap-2">
                      {/* Chunks */}
                      <div className="text-center">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                          {t('knowledge.chunks')}
                        </p>
                        <p className="text-xl font-bold text-foreground tabular-nums">
                          {doc.chunk_count ?? "—"}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="text-center">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                          {t('knowledge.status')}
                        </p>
                        <div className="flex items-center justify-center gap-1">
                          <span
                            className={`text-lg font-bold lowercase ${getStatusTextColor(doc.status)}`}
                          >
                            {t(`common.${doc.status}`)}
                          </span>
                          {isActive && cfg.animate && (
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-40" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pages */}
                      <div className="text-center">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                          {t('knowledge.pages')}
                        </p>
                        <p className="text-xl font-bold text-foreground tabular-nums">
                          {doc.page_count ?? "—"}
                        </p>
                      </div>
                    </div>

                    {/* Action icons row */}
                    <div className="flex items-center justify-center gap-4">
                      {/* Download */}
                      <button
                        onClick={() => onDownload(doc.id)}
                        className="w-10 h-10 rounded-full bg-accent dark:bg-accent/80 flex items-center justify-center text-accent-foreground hover:bg-accent-hover dark:hover:bg-accent transition-colors"
                        title="Download"
                      >
                        <Download className="w-4.5 h-4.5" />
                      </button>

                      {/* PDF badge */}
                      <button
                        onClick={() => onView(doc.id)}
                        className="w-10 h-10 rounded-full bg-accent dark:bg-accent/80 flex items-center justify-center transition-colors hover:bg-accent-hover dark:hover:bg-accent"
                        title="View PDF"
                      >
                        <span className="text-[9px] font-black text-accent-foreground leading-none tracking-tight">
                          PDF
                        </span>
                      </button>

                      {/* File size */}
                      <div
                        className="w-10 h-10 rounded-full bg-accent dark:bg-accent/80 flex items-center justify-center"
                        title={doc.file_size_bytes ? formatBytes(doc.file_size_bytes) : "Unknown size"}
                      >
                        <span className="text-[9px] font-black text-accent-foreground leading-none tracking-tight">
                          {doc.file_size_bytes ? formatBytesShort(doc.file_size_bytes) : "—"}
                        </span>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteConfirm(doc.id)}
                        className="w-10 h-10 rounded-full bg-error/15 dark:bg-error/25 flex items-center justify-center text-error hover:bg-error/25 dark:hover:bg-error/35 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {/* Footer: timestamp */}
                    <div className="pt-3 border-t border-border/50">
                      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(doc.created_at, locale)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusTextColor(status: DocumentStatus): string {
  switch (status) {
    case "indexed":
      return "text-foreground";
    case "error":
      return "text-error";
    case "pending":
      return "text-muted-foreground";
    default:
      return "text-foreground";
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatBytesShort(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return kb >= 100 ? `${Math.round(kb)}K` : `${Math.round(kb)}K`;
  }
  const mb = bytes / (1024 * 1024);
  return mb >= 10 ? `${Math.round(mb)}MB` : `${mb.toFixed(0)}MB`;
}

function formatDate(iso: string, locale: string = "en"): string {
  const d = new Date(iso);
  const localeStr = locale === "bn" ? "bn-BD" : "en-US";
  return d.toLocaleDateString(localeStr, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
