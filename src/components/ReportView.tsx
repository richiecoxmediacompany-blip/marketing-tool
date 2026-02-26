"use client";

import { CompanyReport } from "@/lib/types";

interface ReportViewProps {
  report: CompanyReport;
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function MarketPositionBadge({
  category,
}: {
  category: string;
}) {
  const colors: Record<string, string> = {
    Leader: "bg-green-100 text-green-800 border-green-200",
    Challenger: "bg-blue-100 text-blue-800 border-blue-200",
    "Niche Player": "bg-purple-100 text-purple-800 border-purple-200",
    Emerging: "bg-amber-100 text-amber-800 border-amber-200",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colors[category] || "bg-gray-100 text-gray-800 border-gray-200"}`}
    >
      {category}
    </span>
  );
}

export default function ReportView({ report }: ReportViewProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center pb-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {report.companyName}
        </h1>
        {report.website && (
          <a
            href={
              report.website.startsWith("http")
                ? report.website
                : `https://${report.website}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block"
          >
            {report.website}
          </a>
        )}
        <div className="mt-3">
          <MarketPositionBadge category={report.marketPosition.category} />
        </div>
      </div>

      {/* Company Overview */}
      <SectionCard title="Company Overview">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {report.overview}
        </p>
      </SectionCard>

      {/* Two column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Model */}
        <SectionCard title="Business Model">
          <p className="text-gray-700 leading-relaxed">
            {report.businessModel}
          </p>
        </SectionCard>

        {/* Target Market */}
        <SectionCard title="Target Market">
          <p className="text-gray-700 leading-relaxed">
            {report.targetMarket}
          </p>
        </SectionCard>
      </div>

      {/* Products & Services */}
      <SectionCard title="Products & Services">
        <div className="flex flex-wrap gap-2">
          {report.productsAndServices.map((product, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-blue-50 text-blue-800 rounded-lg text-sm font-medium border border-blue-100"
            >
              {product}
            </span>
          ))}
        </div>
      </SectionCard>

      {/* Competitors */}
      <SectionCard title="Top Competitors">
        <div className="space-y-4">
          {report.competitors.map((competitor, index) => (
            <div
              key={index}
              className="flex gap-4 items-start p-3 rounded-lg bg-gray-50"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {competitor.name}
                </h3>
                <p className="text-gray-600 text-sm mt-0.5">
                  {competitor.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Recent News */}
      <SectionCard title="Recent News & Developments">
        <div className="space-y-4">
          {report.recentNews.map((news, index) => (
            <div key={index} className="border-l-4 border-blue-400 pl-4 py-1">
              <h3 className="font-semibold text-gray-900">{news.headline}</h3>
              <p className="text-gray-600 text-sm mt-1">{news.summary}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Market Position */}
      <SectionCard title="Market Position Analysis">
        <div className="flex items-start gap-4">
          <MarketPositionBadge category={report.marketPosition.category} />
          <p className="text-gray-700 leading-relaxed">
            {report.marketPosition.explanation}
          </p>
        </div>
      </SectionCard>

      {/* Download button placeholder */}
      <div className="flex justify-center pt-4 pb-8">
        <button
          onClick={() => window.print()}
          className="px-8 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
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
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download as PDF
        </button>
      </div>
    </div>
  );
}
