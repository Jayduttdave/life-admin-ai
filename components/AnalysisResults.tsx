"use client";

import { useState } from "react";
import { AnalysisResult } from "@/types/analysis";

interface AnalysisResultsProps {
  result: AnalysisResult;
  fileName?: string;
  onReset: () => void;
}

function formatItemContent(item: unknown): string {
  if (typeof item === "string") return item;
  if (typeof item === "number") return String(item);
  if (item && typeof item === "object") {
    const obj = item as Record<string, unknown>;
    if (obj.deadline && obj.action) return `${obj.deadline}: ${obj.action}`;
    if (obj.date && obj.description) return `${obj.date}: ${obj.description}`;
    if (obj.action) return String(obj.action);
    if (obj.title && obj.description) return `${obj.title} — ${obj.description}`;
    if (obj.text) return String(obj.text);
    if (obj.description) return String(obj.description);
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" • ");
  }
  return String(item ?? "");
}

export function AnalysisResults({
  result,
  fileName,
  onReset,
}: AnalysisResultsProps) {
  const [copied, setCopied] = useState(false);

  // If result is wrapped inside 'output', unwrap it; otherwise use result directly
  const data: AnalysisResult =
    (result?.output && typeof result.output === "object" ? result.output : result) || {};

  const documentType =
    typeof data.document_type === "string" && data.document_type.trim().length > 0
      ? data.document_type.trim()
      : undefined;

  const summary =
    typeof data.summary === "string" && data.summary.trim().length > 0
      ? data.summary.trim()
      : undefined;

  const nextStep =
    typeof data.next_step === "string" && data.next_step.trim().length > 0
      ? data.next_step.trim()
      : undefined;

  const hasWarnings = Array.isArray(data.warnings) && data.warnings.length > 0;
  const hasActions =
    Array.isArray(data.required_actions) && data.required_actions.length > 0;
  const hasDeadlines =
    Array.isArray(data.deadlines) && data.deadlines.length > 0;
  const hasImportantInfo =
    Array.isArray(data.important_information) &&
    data.important_information.length > 0;
  const hasRequiredDocs =
    Array.isArray(data.required_documents) &&
    data.required_documents.length > 0;

  const handleCopySummary = async () => {
    const parts: string[] = [];
    if (documentType) parts.push(`Document Type: ${documentType}`);
    if (summary) parts.push(`\nSummary:\n${summary}`);
    if (nextStep) parts.push(`\nImmediate Next Step:\n${nextStep}`);
    if (hasActions) {
      parts.push(
        `\nRequired Actions:\n${data.required_actions!
          .map((a, i) => `${i + 1}. ${formatItemContent(a)}`)
          .join("\n")}`
      );
    }
    if (hasDeadlines) {
      parts.push(
        `\nDeadlines:\n${data.deadlines!
          .map((d) => `• ${formatItemContent(d)}`)
          .join("\n")}`
      );
    }

    try {
      await navigator.clipboard.writeText(parts.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Top Bar: Status, Document Type & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Analysis Complete
              </span>
              {fileName && (
                <span className="text-xs text-zinc-500 hidden sm:inline">
                  • {fileName}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              {documentType || "Document Action Plan"}
            </h2>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <svg
                  className="w-3.5 h-3.5 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Copied</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy Plan</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-900 hover:bg-white transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5 text-zinc-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Analyze another
          </button>
        </div>
      </div>

      {/* 8. Warnings: Visually Distinct Warning Treatment (Only shown if warnings exist) */}
      {hasWarnings && (
        <section
          aria-labelledby="warnings-heading"
          className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-5 sm:p-6 backdrop-blur-md shadow-lg shadow-amber-950/20"
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mt-0.5">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="flex-1">
              <h3
                id="warnings-heading"
                className="text-base font-semibold text-amber-200 tracking-tight mb-2"
              >
                Warnings & Critical Notices
              </h3>
              <ul className="space-y-2 text-sm text-amber-100/90">
                {data.warnings!.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 select-none mt-1">•</span>
                    <span className="leading-relaxed">
                      {formatItemContent(warning)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 7. Next Step: Visually Prominent Hero Highlight */}
      {nextStep && (
        <section
          aria-labelledby="next-step-heading"
          className="rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 via-zinc-900/60 to-zinc-900/60 p-6 sm:p-7 backdrop-blur-md shadow-xl shadow-indigo-950/20"
        >
          <div className="flex items-center gap-2 mb-2.5">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">
              Immediate Next Step
            </span>
          </div>
          <h3
            id="next-step-heading"
            className="text-lg sm:text-xl font-medium text-white leading-relaxed"
          >
            {nextStep}
          </h3>
        </section>
      )}

      {/* 2. Summary Section */}
      {summary && (
        <section
          aria-labelledby="summary-heading"
          className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-7 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-4 h-4 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <line x1="21" y1="10" x2="3" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="21" y1="18" x2="7" y2="18" />
            </svg>
            <h3
              id="summary-heading"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
            >
              Summary
            </h3>
          </div>
          <p className="text-zinc-200 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {summary}
          </p>
        </section>
      )}

      {/* Two Column Grid: Actions & Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 6. Required Actions */}
        {hasActions && (
          <section
            aria-labelledby="actions-heading"
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-4 h-4 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                <h3
                  id="actions-heading"
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-300"
                >
                  Required Actions ({data.required_actions!.length})
                </h3>
              </div>
              <ul className="space-y-3">
                {data.required_actions!.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-zinc-200">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 font-mono text-[10px] font-semibold text-zinc-300 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">
                      {formatItemContent(action)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 4. Deadlines */}
        {hasDeadlines && (
          <section
            aria-labelledby="deadlines-heading"
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-4 h-4 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <h3
                  id="deadlines-heading"
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-300"
                >
                  Deadlines ({data.deadlines!.length})
                </h3>
              </div>
              <ul className="space-y-3">
                {data.deadlines!.map((deadline, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-3 text-sm text-zinc-200"
                  >
                    <span className="text-amber-400 select-none mt-0.5">•</span>
                    <span className="leading-relaxed">
                      {formatItemContent(deadline)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>

      {/* Two Column Grid: Important Information & Required Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3. Important Information */}
        {hasImportantInfo && (
          <section
            aria-labelledby="info-heading"
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md"
          >
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-4 h-4 text-sky-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <h3
                id="info-heading"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-300"
              >
                Important Information ({data.important_information!.length})
              </h3>
            </div>
            <ul className="space-y-2.5 text-sm text-zinc-300">
              {data.important_information!.map((info, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-sky-400 select-none mt-0.5">•</span>
                  <span className="leading-relaxed">{formatItemContent(info)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 5. Required Documents */}
        {hasRequiredDocs && (
          <section
            aria-labelledby="req-docs-heading"
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md"
          >
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-4 h-4 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <h3
                id="req-docs-heading"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-300"
              >
                Required Documents ({data.required_documents!.length})
              </h3>
            </div>
            <ul className="space-y-2.5 text-sm text-zinc-300">
              {data.required_documents!.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-emerald-400 select-none mt-0.5">•</span>
                  <span className="leading-relaxed">{formatItemContent(doc)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
