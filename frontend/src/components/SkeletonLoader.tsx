/**
 * SkeletonLoader – Loading state shown on the Results page while
 * detection is running. Uses shimmer animation to indicate activity.
 *
 * Matches the results page two-column layout:
 *   Left  – image placeholder
 *   Right – detection summary card placeholder
 * Below: confidence list placeholder rows
 */

export default function SkeletonLoader() {
  return (
    <div className="animate-pulse">
      {/* ── Sub-header skeleton ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#c8c7b8] px-4 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="skeleton w-4 h-4 rounded-full" />
          <div className="skeleton h-4 w-36 rounded" />
        </div>
        <div className="skeleton h-9 w-28 rounded-sm" />
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-0">

        {/* ── Left: Image skeleton ──────────────────────────────────────── */}
        <div className="flex-1 p-4 md:p-8">
          <div className="border border-[#c8c7b8]">
            <div className="skeleton w-full h-64 md:h-96 lg:h-[480px]" />
          </div>
          {/* Image caption skeleton */}
          <div className="mt-3 flex gap-4">
            <div className="skeleton h-3 w-40 rounded" />
            <div className="skeleton h-3 w-32 rounded" />
          </div>
        </div>

        {/* ── Right: Summary card skeleton ─────────────────────────────── */}
        <div className="lg:w-80 xl:w-96 px-4 md:px-8 pb-4 md:pb-8 lg:pl-0">
          {/* Detection summary card */}
          <div className="bg-white border border-[#c8c7b8] p-6" style={{ borderTop: '4px solid #e1e3e4' }}>
            <div className="skeleton h-3 w-40 rounded mb-5" />
            <div className="flex items-baseline gap-3">
              <div className="skeleton h-16 w-20 rounded" />
              <div className="skeleton h-5 w-16 rounded" />
            </div>
          </div>

          {/* Confidence list skeleton */}
          <div className="mt-4 bg-white border border-[#c8c7b8] overflow-hidden" style={{ borderTop: '4px solid #e1e3e4' }}>
            <div className="px-5 py-4 border-b border-[#e1e3e4]">
              <div className="skeleton h-3 w-36 rounded" />
            </div>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="px-5 py-3.5 border-b border-[#f3f4f5] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="skeleton h-3 w-14 rounded" />
                  <div className="skeleton h-2 w-24 rounded-full" />
                </div>
                <div className="skeleton h-3 w-10 rounded" />
              </div>
            ))}
          </div>

          {/* Processing indicator */}
          <div className="mt-6 flex items-center gap-3">
            {/* Spinner */}
            <svg
              className="animate-spin w-5 h-5 text-[#4b5320] flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-xs font-bold uppercase tracking-widest text-[#77786b]">
              Analyzing imagery…
            </span>
          </div>
        </div>
      </div>

      {/* ── Mobile-only: stacked skeleton ─────────────────────────────────── */}
      <div className="lg:hidden px-4 pb-24">
        <div className="skeleton h-3 w-32 rounded mb-4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-[#f3f4f5]">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-3 w-12 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
