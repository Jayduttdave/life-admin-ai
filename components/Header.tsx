"use client";

interface HeaderProps {
  onOpenPrivacy?: () => void;
}

export function Header({ onOpenPrivacy }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#090a0f]/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <a
          href="#"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-lg p-1"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-zinc-100 group-hover:border-zinc-500 transition-colors shadow-sm">
            {/* Minimalist document-action icon */}
            <svg
              className="w-4 h-4 text-zinc-200 group-hover:text-white transition-colors"
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
          <span className="text-base font-semibold tracking-tight text-white group-hover:text-zinc-200 transition-colors">
            Life Admin AI
          </span>
        </a>

        {/* Minimal Navigation */}
        <nav aria-label="Main Navigation" className="flex items-center gap-6 sm:gap-8">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded px-1"
          >
            How it works
          </a>
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded px-1 cursor-pointer"
          >
            Privacy
          </button>
        </nav>
      </div>
    </header>
  );
}
