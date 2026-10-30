"use client";

import {
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PIPELINE_STEPS, STATUS_CONFIG } from "@/lib/types/documents";
import type { TrackedDocument, DocumentStatus } from "@/lib/types/documents";

interface ProcessingTrackerProps {
  trackedDocs: TrackedDocument[];
  onCancel: (docId: string) => void;
}

const TERMINAL: DocumentStatus[] = ["indexed", "error", "deleted"];

export function ProcessingTracker({ trackedDocs, onCancel }: ProcessingTrackerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (trackedDocs.length === 0) return null;

  const hasActiveProcessing = trackedDocs.some((doc) => !TERMINAL.includes(doc.status));

  return (
    <div 
      className={`space-y-3 transition-all duration-500 ease-in-out ${
        hasActiveProcessing 
          ? 'opacity-100 max-h-[2000px]' 
          : 'opacity-0 max-h-0 overflow-hidden'
      }`}
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Active Processing
      </h3>
      {trackedDocs.map((doc) => {
        const isTerminal = TERMINAL.includes(doc.status);
        const isExpanded = expanded[doc.docId] ?? false;
        const currentStepIdx = PIPELINE_STEPS.findIndex(
          (s) => s.key === doc.status
        );
        const elapsed = Math.round(
          (Date.now() - new Date(doc.startedAt).getTime()) / 1000
        );

        return (
          <div
            key={doc.docId}
            className={`rounded-xl border px-4 py-3 transition-colors ${
              doc.status === "error"
                ? "border-rose-200 bg-rose-50/30"
                : doc.status === "indexed"
                ? "border-emerald-200 bg-emerald-50/30"
                : "border-border bg-card"
            }`}
          >
            {/* Header row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <StatusIcon status={doc.status} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate max-w-[220px]">
                    {doc.filename}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatElapsed(elapsed)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Status badge */}
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    STATUS_CONFIG[doc.status]?.color ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {STATUS_CONFIG[doc.status]?.label ?? doc.status}
                </span>

                {/* Cancel button — only for active */}
                {!isTerminal && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                    onClick={() => onCancel(doc.docId)}
                    title="Cancel processing"
                  >
                    <Ban className="w-3.5 h-3.5" />
                  </Button>
                )}

                {/* Expand events */}
                {doc.events.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400"
                    onClick={() =>
                      setExpanded((p) => ({
                        ...p,
                        [doc.docId]: !isExpanded,
                      }))
                    }
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Pipeline progress bar */}
            <div className="flex items-center gap-1 mt-3">
              {PIPELINE_STEPS.map((step, i) => {
                const isComplete = i < currentStepIdx;
                const isCurrent = i === currentStepIdx;
                const isFailed = doc.status === "error" && isCurrent;

                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                        isFailed
                          ? "bg-rose-400"
                          : isComplete
                          ? "bg-emerald-400"
                          : isCurrent
                          ? "bg-primary animate-pulse"
                          : "bg-gray-100"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-medium ${
                        isFailed
                          ? "text-rose-500"
                          : isComplete || isCurrent
                          ? "text-gray-700"
                          : "text-gray-300"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Expanded events log */}
            {isExpanded && doc.events.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5 max-h-40 overflow-y-auto">
                {doc.events.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-start gap-2 text-xs text-gray-500"
                  >
                    <span className="text-gray-300 flex-shrink-0 w-16">
                      {new Date(evt.created_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                    <span className="font-medium text-gray-600 w-24 flex-shrink-0">
                      {evt.event_type}
                    </span>
                    <span className="text-gray-400 truncate">
                      {evt.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusIcon({ status }: { status: DocumentStatus }) {
  switch (status) {
    case "indexed":
      return <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
    case "error":
      return <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />;
    case "deleted":
      return <Ban className="w-5 h-5 text-gray-400 flex-shrink-0" />;
    default:
      return <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />;
  }
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}
