"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { TrustDisclaimer } from "@/components/TrustDisclaimer";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { PrivacyModal } from "@/components/PrivacyModal";
import { AnalysisResults } from "@/components/AnalysisResults";
import { AnalysisResult } from "@/types/analysis";

export default function Home() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysisSuccess = (result: AnalysisResult, file: File) => {
    setAnalysisResult(result);
    setSelectedFile(file);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setSelectedFile(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-zinc-100 selection:bg-indigo-500/20 selection:text-indigo-200">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-ambient-glow opacity-80" />
        <div className="absolute inset-0 bg-dot-pattern opacity-25" />
      </div>

      {/* Header */}
      <Header onOpenPrivacy={() => setIsPrivacyOpen(true)} />

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center">
        {!analysisResult ? (
          <>
            {/* Hero Section */}
            <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16 text-center">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3.5 py-1 text-xs backdrop-blur-md mb-6 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span className="font-semibold uppercase tracking-widest text-[11px] text-zinc-300">
                  DOCUMENT INTELLIGENCE
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white max-w-3xl mx-auto leading-[1.15] sm:leading-[1.12]">
                Turn confusing documents into clear actions.
              </h1>

              {/* Supporting Text */}
              <p className="mt-5 mb-10 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                Upload a document and get a simple summary, important information, required actions, deadlines, and your next step.
              </p>

              {/* Primary Upload Area */}
              <UploadZone
                onAnalysisSuccess={handleAnalysisSuccess}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
              />

              {/* Trust / Disclaimer */}
              <TrustDisclaimer />
            </section>

            {/* How It Works Section */}
            <HowItWorks />
          </>
        ) : (
          /* Results View */
          <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-20">
            <AnalysisResults
              result={analysisResult}
              fileName={selectedFile?.name}
              onReset={handleReset}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer onOpenPrivacy={() => setIsPrivacyOpen(true)} />

      {/* Accessible Privacy Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
