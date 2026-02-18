"use client";

export default function LoadingState() {
  return (
    <div className="w-full max-w-2xl mx-auto mt-16">
      <div className="flex flex-col items-center gap-6">
        {/* Animated research icon */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Researching company...
          </h2>
          <p className="text-gray-500">
            Searching the web and analyzing data. This usually takes 15-30
            seconds.
          </p>
        </div>

        {/* Skeleton loading cards */}
        <div className="w-full space-y-4 mt-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
                <div className="h-3 bg-gray-100 rounded w-4/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
