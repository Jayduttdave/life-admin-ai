"use client";

import { useEffect, useRef } from "react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-black/80 transition-all z-10"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Data Privacy & Security
              </span>
            </div>
            <h2
              id="privacy-modal-title"
              className="text-xl font-semibold text-white tracking-tight"
            >
              How we handle your documents
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4 text-sm text-zinc-300 leading-relaxed">
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
            <h3 className="font-medium text-white mb-1">1. Ephemeral Document Processing</h3>
            <p className="text-xs text-zinc-400">
              Documents are processed solely to extract summaries, key deadlines, obligations, and action items. We do not maintain persistent copies of your private paperwork.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
            <h3 className="font-medium text-white mb-1">2. Zero Model Training</h3>
            <p className="text-xs text-zinc-400">
              Your files and extracted information are never used to train, retrain, or improve public AI models.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
            <h3 className="font-medium text-white mb-1">3. Strict Confidentiality</h3>
            <p className="text-xs text-zinc-400">
              Your documents are kept strictly confidential and are not shared with advertisers, brokers, or unrelated third parties.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
            <h3 className="font-medium text-white mb-1">4. Human Oversight Required</h3>
            <p className="text-xs text-zinc-400">
              Life Admin AI provides automated assistive analysis. You should always verify critical numbers, dates, and instructions against the original or issuing authority.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 text-sm font-medium transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
