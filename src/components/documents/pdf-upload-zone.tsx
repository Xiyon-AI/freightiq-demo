"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useLanguage } from "@/lib/i18n/LanguageContext";

type UploadStage = "idle" | "done" | "error";

interface PdfUploadZoneProps {
  onUploadComplete: (docId: string, filename: string, file: File) => void;
}

export function PdfUploadZone({ onUploadComplete }: PdfUploadZoneProps) {
  const { t } = useLanguage();
  const [stage, setStage] = useState<UploadStage>("idle");
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStage("idle");
    setFileName("");
    setErrorMsg("");
  }, []);

  const upload = useCallback((file: File) => {
    setFileName(file.name);
    setErrorMsg("");
    setStage("done");
    onUploadComplete(`local-${Date.now()}`, file.name, file);
  }, [onUploadComplete]);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const file = fileList[0];
      if (!file) return;

      // Validate
      const allowedExts = ["pdf"];
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!allowedExts.includes(ext)) {
        setErrorMsg(`${t('common.unsupportedFileType') || 'Unsupported file type'}: .${ext}`);
        setStage("error");
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        setErrorMsg("File exceeds the 4 MB extraction limit");
        setStage("error");
        return;
      }

      upload(file);
    },
    [upload, t]
  );

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
        onClick={() => inputRef.current?.click()}
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
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {stage === "done" ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-accent-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">PDF opened in review</p>
            <p className="max-w-sm truncate text-xs text-muted-foreground">{fileName}</p>
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
              Rate confirmation PDF · up to 4 MB · extracted with Gemini
            </p>
          </>
        )}
      </div>
    </div>
  );
}
