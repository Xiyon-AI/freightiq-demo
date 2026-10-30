"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useLanguage } from "@/lib/i18n/LanguageContext";

type UploadStage = "idle" | "uploading-storage" | "triggering-index" | "done" | "error";

interface PdfUploadZoneProps {
  orgId: string;
  disabled?: boolean;
  onUploadComplete: (docId: string, filename: string) => void;
}

export function PdfUploadZone({ orgId: _orgId, disabled, onUploadComplete: _onUploadComplete }: PdfUploadZoneProps) {
  const { t } = useLanguage();
  const [stage, setStage] = useState<UploadStage>("idle");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStage("idle");
    setFileName("");
    setProgress(0);
    setErrorMsg("");
  }, []);

  const upload = useCallback(async (_file: File) => {}, []);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const file = fileList[0];
      if (!file) return;

      // Validate
      const allowedExts = ["pdf", "docx", "txt", "csv", "html", "md"];
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!allowedExts.includes(ext)) {
        setErrorMsg(`${t('common.unsupportedFileType') || 'Unsupported file type'}: .${ext}`);
        setStage("error");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setErrorMsg(t('common.fileSizeError') || "File exceeds 50MB limit");
        setStage("error");
        return;
      }

      upload(file);
    },
    [upload, t]
  );

  const isUploading = stage === "uploading-storage" || stage === "triggering-index";

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`
          relative p-12 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          flex flex-col items-center justify-center text-center
          ${dragOver
            ? "border-accent bg-accent-light/60 scale-[1.01]"
            : "border-border bg-muted/30/30 hover:border-accent hover:bg-accent-light/20"
          }
          ${isUploading ? "pointer-events-none opacity-70" : ""}
          ${disabled ? "pointer-events-none opacity-50" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.csv,.html,.md"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3 w-full max-w-sm">
            <Loader2 className="w-10 h-10 text-foreground animate-spin" />
            <p className="text-sm font-semibold text-foreground truncate max-w-full">
              {fileName}
            </p>
            <p className="text-xs text-neutral-500">
              {stage === "uploading-storage" ? (t('common.uploading') || "Uploading to storage...") : (t('common.indexing') || "Triggering indexing...")}
            </p>
            <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : stage === "done" ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-accent-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">{t('common.uploadComplete') || 'Upload complete'}</p>
          </div>
        ) : stage === "error" ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
              <X className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">{errorMsg}</p>
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground hover:text-foreground font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
            >
              {t('common.tryAgain') || 'Try again'}
            </Button>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-accent-light flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm border border-accent-light">
              <Upload className="w-7 h-7 text-foreground" strokeWidth={2} />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {t('knowledge.uploadPlaceholder')}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              PDF, DOCX, TXT, CSV, HTML, MD — up to 50 MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}
