export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Upload",
      tagline: "Drop your document.",
      description:
        "Upload any confusing paperwork — medical bills, tax notices, leases, utility demands, or government letters.",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <polyline points="9 15 12 12 15 15" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Analyze",
      tagline: "AI extracts and understands the important information.",
      description:
        "Our intelligent workflow cuts through administrative jargon to pinpoint exact balances, critical deadlines, and binding obligations.",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Act",
      tagline: "Get a clear action plan and next step.",
      description:
        "Receive a plain-English briefing, required actions sorted by priority, and exactly what you need to do next without guesswork.",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 border-t border-white/[0.06]"
    >
      <div className="text-center mb-12 sm:mb-16">
        <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">
          Process Overview
        </span>
        <h2
          id="how-it-works-heading"
          className="text-2xl sm:text-3xl font-semibold tracking-tight text-white"
        >
          How it works
        </h2>
        <p className="mt-2 text-sm text-zinc-400 max-w-lg mx-auto">
          From complex paperwork to confident action in three straightforward steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {steps.map((step) => (
          <div
            key={step.number}
            className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6 sm:p-7 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/90 hover:bg-zinc-900/60 flex flex-col justify-between"
          >
            {/* Top row: step number + icon */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-xs font-semibold text-zinc-400 tracking-wider">
                  {step.number}
                </span>
                <div className="w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-300 flex items-center justify-center group-hover:border-zinc-700 group-hover:text-white transition-colors">
                  {step.icon}
                </div>
              </div>

              {/* Title & Tagline */}
              <h3 className="text-lg font-semibold text-white tracking-tight mb-2">
                {step.title}
              </h3>
              <p className="text-sm font-medium text-zinc-200 mb-3">
                {step.tagline}
              </p>
            </div>

            {/* Explanatory description */}
            <p className="text-xs text-zinc-400 leading-relaxed pt-2 border-t border-zinc-800/60">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
