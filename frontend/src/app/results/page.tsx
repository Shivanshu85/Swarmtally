'use client'

/**
 * Results Page – /results
 *
 * Displays the YOLOv8 detection output:
 *   • Annotated image (bounding boxes drawn by backend)
 *   • Detection Summary card (drone count)
 *   • Confidence scores per drone (DRN-01, DRN-02…)
 *   • Re-Detect button to go back
 *
 * Data flow:
 *   Upload page → sessionStorage → this page
 *
 * Responsive layout:
 *   Desktop: Two-column (image | summary sidebar)
 *   Mobile:  Single column, bottom nav
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import SkeletonLoader from '@/components/SkeletonLoader'
import type { DetectionResult } from '@/types/detection'

/* ── Page component ──────────────────────────────────────────────────────── */
export default function ResultsPage() {
  const router = useRouter()

  const [result, setResult]             = useState<DetectionResult | null>(null)
  const [originalUrl, setOriginalUrl]   = useState<string | null>(null)
  const [isLoading, setIsLoading]       = useState(true)
  const [imageError, setImageError]     = useState(false)

  // Backend base URL (for constructing image URLs)
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

  /* ── Read results from sessionStorage on mount ─────────────────────────── */
  useEffect(() => {
    const stored = sessionStorage.getItem('detectionResult')
    const origUrl = sessionStorage.getItem('originalImageUrl')

    if (!stored) {
      // No detection result – redirect to upload page
      router.replace('/')
      return
    }

    try {
      const parsed: DetectionResult = JSON.parse(stored)
      setResult(parsed)
      setOriginalUrl(origUrl ?? null)
    } catch {
      router.replace('/')
    } finally {
      // sessionStorage reads are synchronous – no artificial delay needed.
      setIsLoading(false)
    }
  }, [router])

  /* ── Navigate back to upload ───────────────────────────────────────────── */
  const handleReDetect = () => {
    sessionStorage.removeItem('detectionResult')
    sessionStorage.removeItem('originalImageUrl')
    router.push('/')
  }

  /* ── Build the processed image URL ────────────────────────────────────── */
  const processedImageUrl = result
    ? `${apiUrl}${result.processed_image_url}`
    : null

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen grid-bg" role="main">
      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <Navbar />
      <MobileNav />

      {/* ── Skeleton while loading ──────────────────────────────────────── */}
      {isLoading && <SkeletonLoader />}

      {/* ── Results content ──────────────────────────────────────────────── */}
      {!isLoading && result && (
        <div className="max-w-[1200px] mx-auto">

          {/* ── Sub-header bar ─────────────────────────────────────────── */}
          {/* Matches design: shield icon + "DRONE DETECTION" + RE-DETECT btn */}
          <div
            className="bg-white border-b border-[#c8c7b8] px-4 md:px-10 py-3.5 flex items-center justify-between"
            style={{ borderLeft: '4px solid #4b5320' }}
          >
            <div className="flex items-center gap-2.5">
              {/* Shield icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" fill="#4b5320"/>
              </svg>
              <span className="text-xs font-bold uppercase tracking-widest text-[#343c0a]">
                Drone Detection
              </span>
            </div>

            {/* Re-Detect button */}
            <button
              id="re-detect-btn"
              onClick={handleReDetect}
              className="
                bg-[#4b5320] text-white text-xs font-bold uppercase tracking-widest
                px-5 py-2.5 rounded-sm hover:bg-[#343c0a] active:scale-95
                transition-all duration-150 flex items-center gap-1.5
              "
            >
              {/* Refresh icon */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M1 4v6h6M23 20v-6h-6"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
                <path
                  d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              Re-Detect
            </button>
          </div>

          {/* ── Main two-column layout ───────────────────────────────────── */}
          <div className="flex flex-col lg:flex-row">

            {/* ── LEFT: Annotated image panel ──────────────────────────── */}
            <div className="flex-1 p-4 md:p-8">
              {/* Mobile heading (matches mobile result page design) */}
              <div className="lg:hidden mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#77786b]">
                  Security Sector 04
                </p>
                <h1 className="text-xl font-bold text-[#191c1d]">Detection Report</h1>
              </div>

              {/* Image frame – dark border mimicking the tactical display */}
              <div
                className="relative border border-[#77786b] bg-[#191c1d] overflow-hidden"
                aria-label="Annotated detection image"
              >
                {/* Tactical corner accents (top-left, bottom-right) */}
                <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#fe9832] z-10" aria-hidden="true" />
                <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#fe9832] z-10" aria-hidden="true" />

                {/* Annotated result image returned by backend */}
                {processedImageUrl && !imageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={processedImageUrl}
                    alt={`Detection result: ${result.drone_count} drone${result.drone_count !== 1 ? 's' : ''} detected`}
                    className="w-full h-auto block"
                    onError={() => setImageError(true)}
                  />
                ) : imageError ? (
                  /* Fallback: show original preview if processed image fails to load */
                  originalUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={originalUrl}
                      alt="Original uploaded image"
                      className="w-full h-auto block opacity-60"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-[#77786b] text-sm">
                      Image could not be loaded
                    </div>
                  )
                ) : null}

                {/* Bottom-left coordinate overlay (military HUD aesthetic) */}
                <div
                  className="absolute bottom-3 left-3 text-white text-[10px] font-mono leading-relaxed"
                  aria-hidden="true"
                >
                  <div className="bg-black/50 px-2 py-1">
                    OPTICAL ZOOM 1.0X
                  </div>
                </div>
              </div>

              {/* Image caption / inference stats */}
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                <p className="text-[10px] text-[#77786b] uppercase tracking-widest">
                  Inference: {result.inference_ms} ms
                </p>
                <p className="text-[10px] text-[#77786b] uppercase tracking-widest">
                  Conf. Threshold: 0.25
                </p>
                <p className="text-[10px] text-[#77786b] uppercase tracking-widest">
                  Model: YOLOv8n
                </p>
              </div>
            </div>

            {/* ── RIGHT: Detection summary sidebar ─────────────────────── */}
            <div
              className="lg:w-80 xl:w-96 px-4 md:px-8 pb-6 md:pb-8 lg:pl-0 lg:pt-8"
              aria-label="Detection summary"
            >
              {/* ── Summary card ─────────────────────────────────────────── */}
              <div
                className="bg-white border border-[#c8c7b8]"
                style={{ borderTop: '4px solid #fe9832' }}
              >
                <div className="p-5 md:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#47483c] mb-4">
                    Detection Summary
                  </p>

                  {/* Big drone count – padded to 2 digits like the design (05) */}
                  <div className="flex items-baseline gap-2">
                    <span
                      className="font-extrabold text-[#343c0a] leading-none tabular-nums"
                      style={{ fontSize: '72px', lineHeight: '1' }}
                      aria-label={`${result.drone_count} drones detected`}
                    >
                      {String(result.drone_count).padStart(2, '0')}
                    </span>
                    <span className="text-lg text-[#47483c] font-medium">
                      Drones
                      {result.drone_count !== 1 ? '' : ''}
                    </span>
                  </div>

                  {/* Threat level badge */}
                  {result.drone_count > 0 && (
                    <div className="mt-4 inline-flex items-center gap-1.5 bg-[#ffdcc2] border border-[#fe9832] px-3 py-1 rounded-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#8f4e00] animate-pulse" aria-hidden="true" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#683700]">
                        {result.drone_count >= 5
                          ? 'Swarm Detected'
                          : result.drone_count >= 2
                          ? 'Multiple Contacts'
                          : 'Single Contact'}
                      </span>
                    </div>
                  )}

                  {result.drone_count === 0 && (
                    <div className="mt-4 inline-flex items-center gap-1.5 bg-[#dfe8a6] border border-[#c3cc8c] px-3 py-1 rounded-sm">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#434b18]">
                        Area Clear
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Confidence scores table ─────────────────────────────── */}
              {result.confidences.length > 0 && (
                <div
                  className="mt-4 bg-white border border-[#c8c7b8] overflow-hidden"
                  style={{ borderTop: '4px solid #4b5320' }}
                >
                  {/* Table header */}
                  <div className="px-5 py-3 bg-[#f3f4f5] border-b border-[#e1e3e4]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#47483c]">
                      Contact Confidence Log
                    </p>
                  </div>

                  {/* Confidence rows */}
                  <div className="divide-y divide-[#f3f4f5]">
                    {result.confidences.map((conf, index) => {
                      const pct = Math.round(conf * 100)
                      const label = `DRN-${String(index + 1).padStart(2, '0')}`
                      return (
                        <div
                          key={`${index}-${conf}`}
                          id={`confidence-row-${index + 1}`}
                          className="px-5 py-3 flex items-center gap-3"
                        >
                          {/* Drone label badge */}
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#8f4e00] px-2 py-0.5 rounded-sm flex-shrink-0"
                            aria-label={`Drone ${index + 1}`}
                          >
                            {label}
                          </span>

                          {/* Confidence bar */}
                          <div className="flex-1 relative h-2 bg-[#e1e3e4] rounded-full overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 bg-[#fe9832] rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                              role="progressbar"
                              aria-valuenow={pct}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`${label} confidence: ${pct}%`}
                            />
                          </div>

                          {/* Percentage */}
                          <span className="text-xs font-bold text-[#343c0a] tabular-nums flex-shrink-0 w-10 text-right">
                            {pct}%
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Average confidence footer */}
                  <div className="px-5 py-3 bg-[#f3f4f5] border-t border-[#e1e3e4] flex justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-[#77786b] font-bold">
                      Avg. Confidence
                    </span>
                    <span className="text-xs font-bold text-[#343c0a]">
                      {Math.round(
                        (result.confidences.reduce((a, b) => a + b, 0) /
                          result.confidences.length) *
                          100,
                      )}%
                    </span>
                  </div>
                </div>
              )}

              {/* ── Mobile Re-Detect button ──────────────────────────────── */}
              <div className="lg:hidden mt-5">
                <button
                  id="re-detect-mobile-btn"
                  onClick={handleReDetect}
                  className="
                    w-full bg-[#4b5320] text-white text-xs font-bold uppercase tracking-widest
                    py-4 rounded-sm hover:bg-[#343c0a] active:scale-95
                    transition-all duration-150 flex items-center justify-center gap-2
                  "
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Re-Detect
                </button>
              </div>

              {/* ── Metadata footer ──────────────────────────────────────── */}
              <div className="mt-4 p-4 bg-white border border-[#e1e3e4] hidden lg:block">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#77786b] mb-2">
                  Session Metadata
                </p>
                <div className="space-y-1">
                  <MetaRow label="Inference Time" value={`${result.inference_ms} ms`} />
                  <MetaRow label="Total Contacts" value={`${result.drone_count}`} />
                  <MetaRow label="Confidence Threshold" value="0.25" />
                  <MetaRow label="Model Version" value="YOLOv8n" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── No result state (briefly shown before redirect) ──────────────── */}
      {!isLoading && !result && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#77786b]">
          <p className="text-sm uppercase tracking-widest">No detection data found.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-xs font-bold uppercase tracking-widest text-[#4b5320] hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  )
}

/* ── MetaRow helper ─────────────────────────────────────────────────────── */
function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[10px] text-[#77786b] uppercase tracking-wider">{label}</span>
      <span className="text-[10px] font-bold text-[#343c0a]">{value}</span>
    </div>
  )
}
