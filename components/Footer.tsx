"use client";

interface FooterProps {
  onOpenPrivacy?: () => void;
}

export function Footer({ onOpenPrivacy }: FooterProps) {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#07080c] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-zinc-900">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-zinc-300">
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M9 15l2 2 4-4" />
                </svg>
              </div>
              <span className="text-base font-semibold tracking-tight text-white">
                Life Admin AI
              </span>
            </div>
            <p className="text-sm text-zinc-400">
              Understand the document. Know what to do next.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#how-it-works"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              How it works
            </a>
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Privacy & Security
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <p className="max-w-2xl leading-relaxed">
            Life Admin AI is an independent document intelligence tool designed to clarify paperwork. It does not provide legal, financial, or tax advice. Always verify important information against the original or official source.
          </p>
          <p className="shrink-0">
            &copy; {new Date().getFullYear()} Life Admin AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
