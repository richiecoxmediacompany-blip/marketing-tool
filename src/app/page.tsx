"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import ReportView from "@/components/ReportView";
import LoadingState from "@/components/LoadingState";
import { CompanyReport, ResearchResponse } from "@/lib/types";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<CompanyReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setReport(null);
    setError(null);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data: ResearchResponse = await res.json();

      if (data.success && data.report) {
        setReport(data.report);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Failed to connect to the research service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={handleReset} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">
              MarketIntel
            </span>
          </button>
          {report && (
            <button
              onClick={handleReset}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              New Research
            </button>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6">
        {/* Landing / Search State */}
        {!report && !isLoading && (
          <div className="flex flex-col items-center justify-center pt-24 pb-16">
            <h1 className="text-5xl font-bold text-gray-900 text-center mb-4">
              Marketing Intelligence
            </h1>
            <p className="text-xl text-gray-500 text-center mb-12 max-w-xl">
              Research any company instantly. Get detailed reports on their
              business model, competitors, market position, and more.
            </p>
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />

            {error && (
              <div className="mt-6 px-6 py-4 bg-red-50 border border-red-200 rounded-xl text-red-700 max-w-2xl w-full">
                {error}
              </div>
            )}

            {/* Example searches */}
            <div className="mt-10 flex flex-col items-center gap-3">
              <span className="text-sm text-gray-400">Try researching:</span>
              <div className="flex flex-wrap justify-center gap-2">
                {["Stripe", "Notion", "Figma", "Datadog", "Canva"].map(
                  (company) => (
                    <button
                      key={company}
                      onClick={() => handleSearch(company)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm"
                    >
                      {company}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <LoadingState />}

        {/* Results State */}
        {report && !isLoading && (
          <div className="py-8">
            <ReportView report={report} />
          </div>
        )}
      </div>
    </main>
  );
}
