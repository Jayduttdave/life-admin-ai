"use client";

import { useState, useRef, ChangeEvent, DragEvent, KeyboardEvent } from "react";
import { AnalysisResult } from "@/types/analysis";

const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

interface UploadZoneProps {
  onAnalysisSuccess: (result: AnalysisResult, file: File) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileTypeLabel(fileName: string, mimeType: string): string {
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  if (ext === ".pdf" || mimeType === "application/pdf") return "PDF Document";
  if (ext === ".png" || mimeType === "image/png") return "PNG Image";
  if (ext === ".jpg" || ext === ".jpeg" || mimeType.includes("jpeg")) return "JPG Image";
  return "Document";
}

export function parseN8nResponse(data: unknown): AnalysisResult {
  let item = data;
  if (Array.isArray(item) && item.length > 0) {
    item = item[0];
  }

  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;

    // 1. Check for "output" wrapper
    if (record.output !== undefined && record.output !== null) {
      if (typeof record.output === "string") {
        try {
          item = JSON.parse(record.output);
        } catch {
          item = { summary: record.output };
        }
      } else if (typeof record.output === "object") {
        item = record.output;
      }
    } else if (record.json && typeof record.json === "object" && record.json !== null) {
      // 2. Check for "json" wrapper
      const jsonRec = record.json as Record<string, unknown>;
      if (jsonRec.output !== undefined && jsonRec.output !== null) {
        if (typeof jsonRec.output === "string") {
          try {
            item = JSON.parse(jsonRec.output);
          } catch {
            item = { summary: jsonRec.output };
          }
        } else if (typeof jsonRec.output === "object") {
          item = jsonRec.output;
        }
      } else {
        item = jsonRec;
      }
    } else if (
      record.data &&
      typeof record.data === "object" &&
      record.data !== null &&
      !("summary" in record) &&
      !("document_type" in record)
    ) {
      // 3. Check for "data" wrapper
      const dataRec = record.data as Record<string, unknown>;
      if (dataRec.output && typeof dataRec.output === "object") {
        item = dataRec.output;
      } else {
        item = dataRec;
      }
    }
  }

  if (typeof item === "string") {
    try {
      item = JSON.parse(item);
    } catch {
      item = { summary: item };
    }
  }

  const res = (item as Record<string, unknown>) || {};

  const document_type =
    typeof res.document_type === "string" && res.document_type.trim().length > 0
      ? res.document_type.trim()
      : undefined;

  const summary =
    typeof res.summary === "string" && res.summary.trim().length > 0
      ? res.summary.trim()
      : undefined;

  const next_step =
    typeof res.next_step === "string" && res.next_step.trim().length > 0
      ? res.next_step.trim()
      : undefined;

  const important_information = Array.isArray(res.important_information)
    ? res.important_information
    : [];

  const deadlines = Array.isArray(res.deadlines) ? res.deadlines : [];

  const required_documents = Array.isArray(res.required_documents)
    ? res.required_documents
    : [];

  const required_actions = Array.isArray(res.required_actions)
    ? res.required_actions
    : [];

  const warnings = Array.isArray(res.warnings) ? res.warnings : [];

  const hasAnyContent = Boolean(
    document_type ||
      summary ||
      next_step ||
      important_information.length > 0 ||
      deadlines.length > 0 ||
      required_actions.length > 0 ||
      required_documents.length > 0 ||
      warnings.length > 0
  );

  if (!hasAnyContent) {
    throw new Error(
      "Received response from n8n, but could not find document analysis data. Expected properties inside 'output' or root object."
    );
  }

  return {
    document_type,
    summary,
    important_information,
    deadlines,
    required_documents,
    required_actions,
    next_step,
    warnings,
  };
}

export function UploadZone({
  onAnalysisSuccess,
  isAnalyzing,
  setIsAnalyzing,
  selectedFile,
  setSelectedFile,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const validateAndSetFile = (candidate: File | undefined | null) => {
    setErrorMessage(null);

    if (!candidate) return;

    // Check file extension & mime type
    const extension = candidate.name
      .slice(candidate.name.lastIndexOf("."))
      .toLowerCase();
    const isAllowedExt = ALLOWED_EXTENSIONS.includes(extension);
    const isAllowedMime =
      ALLOWED_MIME_TYPES.includes(candidate.type) ||
      (candidate.type === "" && isAllowedExt);

    if (!isAllowedExt && !isAllowedMime) {
      setErrorMessage(
        "Invalid file format. Please upload a PDF, JPG, or PNG document."
      );
      return;
    }

    // Check size limit
    if (candidate.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(
        `File is too large (${formatFileSize(candidate.size)}). Maximum allowed size is 25 MB.`
      );
      return;
    }

    setSelectedFile(candidate);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAnalyzing) return;
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDragging(false);
      dragCounter.current = 0;
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (isAnalyzing) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      validateAndSetFile(droppedFiles[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    if (isAnalyzing) return;
    fileInputRef.current?.click();
  };

  const handleCardKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleBrowseClick();
    }
  };

  const handleRemoveFile = () => {
    if (isAnalyzing) return;
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyzeClick = async () => {
    if (!selectedFile || isAnalyzing) return;

    setErrorMessage(null);
    setIsAnalyzing(true);

    try {
      // 1. Prepare multipart/form-data with exact binary field name: data0
      const formData = new FormData();
      formData.append("data0", selectedFile);

      // Forward document to /api/analyze which securely communicates with n8n server-side
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      // Handle non-OK status codes
      if (!response.ok) {
        const text = await response.text();
        let errorJson: Record<string, unknown> | null = null;
        try {
          errorJson = JSON.parse(text);
        } catch {
          // Response is not JSON
        }

        // n8n test webhook 404 with execution hint
        if (response.status === 404 || errorJson?.hint) {
          throw new Error(
            "The n8n test webhook is waiting for a trigger. Please click 'Execute workflow' or 'Test step' on your n8n workflow canvas, then click Analyze Document again."
          );
        }

        if (response.status === 503) {
          throw new Error(
            "Cannot connect to the n8n backend service. Please verify that your n8n workflow is active."
          );
        }

        const msg =
          (errorJson?.error as string) ||
          (errorJson?.message as string) ||
          `Server returned status ${response.status}.`;
        throw new Error(msg);
      }

      let rawData: unknown;
      try {
        rawData = await response.json();
      } catch {
        throw new Error("Unable to parse server response as JSON.");
      }

      const parsedResult = parseN8nResponse(rawData);
      onAnalysisSuccess(parsedResult, selectedFile);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during document analysis.";
      setErrorMessage(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        className="sr-only"
        aria-label="Upload document file (PDF, JPG, or PNG)"
        onChange={handleFileInputChange}
        disabled={isAnalyzing}
      />

      {/* Error alert with dismiss and retry */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-200 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="flex items-start gap-2.5">
            <svg
              className="w-5 h-5 shrink-0 text-red-400 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeWidth="2" strokeLinecap="round" d="M12 8v4m0 4h.01" />
            </svg>
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing}
              className="rounded-lg bg-red-900/60 hover:bg-red-800/80 px-2.5 py-1 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-300 hover:text-white text-xs font-medium px-2 py-1 rounded hover:bg-red-900/40 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Upload Box / Card */}
      {!selectedFile ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload document drop zone. Drop your document here or press Enter to browse files."
          onClick={handleBrowseClick}
          onKeyDown={handleCardKeyDown}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80 ${
            isDragging
              ? "border-indigo-400 bg-indigo-950/20 shadow-lg shadow-indigo-500/10 scale-[1.01]"
              : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70"
          }`}
        >
          {/* Subtle radial inner glow */}
          <div
            className={`pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 ${
              isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            } bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.06),transparent_60%)]`}
          />

          {/* Upload Icon Container */}
          <div
            className={`relative mb-5 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border transition-all duration-300 ${
              isDragging
                ? "border-indigo-400/50 bg-indigo-500/20 text-indigo-300 scale-110 shadow-lg shadow-indigo-500/20"
                : "border-zinc-800 bg-zinc-900/90 text-zinc-400 group-hover:border-zinc-700 group-hover:text-zinc-200 group-hover:scale-105"
            }`}
          >
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="12" x2="12" y2="18" />
              <polyline points="9 15 12 12 15 15" />
            </svg>
          </div>

          {/* Main prompt text */}
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-white mb-1.5 transition-colors">
            {isDragging ? "Release to drop your document" : "Drop your document here"}
          </h2>

          {/* Secondary browse hint */}
          <p className="text-sm text-zinc-400 mb-5">
            or click to browse
          </p>

          {/* Clear upload button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleBrowseClick();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-all duration-200 hover:bg-white hover:shadow-md hover:shadow-white/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            <svg
              className="w-4 h-4 text-zinc-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Browse files
          </button>

          {/* Format specifications */}
          <div className="mt-5 flex items-center gap-2">
            <span className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
              PDF, JPG or PNG
            </span>
            <span className="text-xs text-zinc-500">Up to 25MB</span>
          </div>
        </div>
      ) : (
        /* Document Selected State */
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-sm transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
            {/* File Details */}
            <div className="flex items-center gap-4 min-w-0">
              {/* Document Icon Badge */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>

              {/* Name & metadata */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3
                    className="text-base font-medium text-white truncate max-w-[240px] sm:max-w-xs"
                    title={selectedFile.name}
                  >
                    {selectedFile.name}
                  </h3>
                  <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-400/20">
                    Ready
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span>{getFileTypeLabel(selectedFile.name, selectedFile.type)}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleBrowseClick}
                disabled={isAnalyzing}
                className="rounded-lg border border-zinc-700/80 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={isAnalyzing}
                aria-label="Remove selected document"
                className="rounded-lg p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Primary Action Button & Status */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-400 flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isAnalyzing
                    ? "bg-indigo-400 animate-ping"
                    : "bg-emerald-400 animate-pulse"
                }`}
              />
              <span>
                {isAnalyzing
                  ? "Analyzing document with Life Admin AI..."
                  : "Document loaded and ready for analysis"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all active:scale-95 ${
                isAnalyzing
                  ? "bg-zinc-200 text-zinc-700 cursor-not-allowed opacity-90 shadow-none"
                  : "bg-white text-zinc-950 hover:bg-zinc-200 hover:shadow-lg hover:shadow-white/10 cursor-pointer"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin text-zinc-800"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Analyzing document...</span>
                </>
              ) : (
                <>
                  <span>Analyze Document</span>
                  <svg
                    className="w-4 h-4 text-zinc-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* In-Flight Scanning Feedback */}
          {isAnalyzing && (
            <div className="mt-5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 text-xs text-indigo-200 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
                <span className="font-medium text-white">
                  Executing document intelligence pipeline...
                </span>
              </div>
              <p className="mt-1 text-zinc-400 pl-4.5">
                Connecting to n8n AI engine, parsing document structure, identifying deadlines, and generating your next step.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
