export function TrustDisclaimer() {
  return (
    <div className="mt-4 flex items-center justify-center gap-2 text-center">
      <svg
        className="w-3.5 h-3.5 text-zinc-500 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
        Your document is analyzed to generate this result. Always verify important information against the original or official source.
      </p>
    </div>
  );
}
