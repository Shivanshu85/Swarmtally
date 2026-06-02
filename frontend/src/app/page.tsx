'use client'

/**
 * Upload Page (Dashboard) – /
 *
 * Design: "Duty and Honor" military theme.
 * Layout:
 *   1. Navbar (desktop) + MobileNav (bottom)
 *   2. Grid-background hero with olive left-accent headline
 *   3. Olive 4px divider
 *   4. Upload card (dashed zone) → preview → detect button
 *   5. System info cards at bottom
 */

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import UploadZone from '@/components/UploadZone'
import type { DetectionResult } from '@/types/detection'

/* ─────────────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const router = useRouter()

  // ── State ────────────────────────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null)
  const [isLoading, setIsLoading]       = useState(false)
  const [error, setError]               = useState<string | null>(null)

  // ── File select handler ──────────────────────────────────────────────────
  const handleFileSelect = useCallback((file: File) => {
    // Revoke old object URL to avoid memory leaks
    if (previewUrl) URL.revokeObjectURL(previewUrl)

    setSelectedFile(file)
    setError(null)
    setPreviewUrl(URL.createObjectURL(file))
  }, [previewUrl])

  // ── Remove selected image ────────────────────────────────────────────────
  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
  }

  // ── Submit detection ─────────────────────────────────────────────────
  const handleDetect = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    setError(null)

    // Abort the request if it takes longer than 90 seconds (model cold-start + inference)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90_000)

    try {
      // Build form data – matches FastAPI's File(...) parameter name "file"
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/detect', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(
          errData.error ?? `Server returned ${response.status}. Please try again.`
        )
      }

      const data: DetectionResult = await response.json()

      // Persist results and original preview for the results page
      sessionStorage.setItem('detectionResult', JSON.stringify(data))
      sessionStorage.setItem('originalImageUrl', previewUrl ?? '')

      // Navigate to results page
      router.push('/results')
    } catch (err: unknown) {
      clearTimeout(timeoutId)
      const message =
        err instanceof Error && err.name === 'AbortError'
          ? 'Detection timed out. The server took too long to respond.'
          : err instanceof Error
          ? err.message
          : 'An unexpected error occurred.'
      setError(message)
      setIsLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen grid-bg"
      role="main"
    >
      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <Navbar />
      <MobileNav />

      <div className="max-w-[1200px] mx-auto px-4 md:px-10 pb-28 md:pb-16">

        {/* ── Hero heading ─────────────────────────────────────────────── */}
        <section className="pt-8 md:pt-12 pb-6" aria-labelledby="page-title">
          <div className="flex items-stretch gap-4">
            {/* Vertical olive accent bar – matches desktop design */}
            <div className="w-[5px] bg-[#4b5320] rounded-sm flex-shrink-0 my-0.5" aria-hidden="true" />
            <div>
              <h1
                id="page-title"
                className="text-3xl md:text-[42px] lg:text-[48px] font-extrabold uppercase text-[#343c0a] leading-tight tracking-tight"
              >
                Detection Initiative
              </h1>
              <p className="mt-1.5 text-sm md:text-base text-[#47483c] leading-relaxed">
                Upload imagery for automated count analysis.
              </p>
            </div>
          </div>
        </section>

        {/* ── Olive divider bar ────────────────────────────────────────── */}
        {/* Matches the thick dark line below the hero in the design      */}
        <div className="h-[4px] bg-[#343c0a] mb-6" aria-hidden="true" />

        {/* ── Upload card ──────────────────────────────────────────────── */}
        <div className="bg-white border border-[#c8c7b8]">

          {/* Drop zone */}
          <UploadZone onFileSelect={handleFileSelect} hasFile={!!selectedFile} />

          {/* ── Preview section ─────────────────────────────────────────── */}
          {previewUrl && selectedFile && (
            <div className="px-4 md:px-8 pb-6 border-t border-[#e1e3e4]">
              <div className="flex flex-col sm:flex-row gap-5 pt-5">
                {/* Thumbnail */}
                <div className="w-full sm:w-52 flex-shrink-0 border border-[#c8c7b8] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Selected image preview"
                    className="w-full h-28 sm:h-36 object-cover"
                  />
                </div>

                {/* File metadata */}
                <div className="flex-1 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#77786b] mb-1">
                    Selected Image
                  </p>
                  <p className="text-sm font-semibold text-[#191c1d] truncate max-w-xs">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-[#77786b] mt-0.5">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    &nbsp;·&nbsp;
                    {selectedFile.type.split('/')[1].toUpperCase()}
                  </p>

                  {/* Status badge */}
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-[#dfe8a6] border border-[#c3cc8c] px-2.5 py-1 rounded-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4b5320]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#434b18]">
                      Ready for analysis
                    </span>
                  </div>

                  <button
                    onClick={handleReset}
                    disabled={isLoading}
                    className="mt-3 block text-[10px] text-[#8f4e00] uppercase tracking-widest font-bold hover:underline disabled:opacity-40"
                  >
                    Remove image
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Error banner ──────────────────────────────────────────────── */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="mx-4 md:mx-8 mb-5 px-4 py-3 bg-[#ffdad6] border border-[#ba1a1a] rounded-sm flex gap-2 items-start"
            >
              <span className="text-[#93000a] text-lg leading-none mt-0.5" aria-hidden="true">⚠</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#93000a]">
                  Detection Error
                </p>
                <p className="text-xs text-[#93000a] mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* ── Action row ────────────────────────────────────────────────── */}
          {selectedFile && (
            <div className="px-4 md:px-8 pb-6 md:pb-8 flex flex-col sm:flex-row gap-3">
              {/* PRIMARY: Initiate Detection */}
              <button
                id="initiate-detection-btn"
                onClick={handleDetect}
                disabled={isLoading}
                aria-label="Initiate drone detection"
                className={`
                  flex-1 sm:flex-none px-8 py-3.5 text-xs font-bold uppercase tracking-widest
                  rounded-sm transition-all duration-150 flex items-center justify-center gap-2
                  ${isLoading
                    ? 'bg-[#77786b] text-white cursor-not-allowed opacity-80'
                    : 'bg-[#4b5320] text-white hover:bg-[#343c0a] active:scale-95'
                  }
                `}
              >
                {isLoading ? (
                  <>
                    {/* Spinner */}
                    <svg
                      className="animate-spin w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Analyzing…
                  </>
                ) : (
                  <>
                    {/* Arrow icon */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Initiate Detection
                  </>
                )}
              </button>

              {/* SECONDARY: Cancel / Change image */}
              {!isLoading && (
                <button
                  onClick={handleReset}
                  className="
                    px-6 py-3.5 text-xs font-bold uppercase tracking-widest
                    border border-[#222894] text-[#222894] rounded-sm
                    hover:bg-[#222894]/5 active:scale-95 transition-all duration-150
                  "
                >
                  Change Image
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── System info cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          {[
            {
              id: 'info-model',
              label: 'AI Model',
              value: 'YOLOv8n',
              desc: 'Ultralytics nano detection',
            },
            {
              id: 'info-classes',
              label: 'Detection Class',
              value: '01',
              desc: 'Drone — single class model',
            },
            {
              id: 'info-conf',
              label: 'Min. Confidence',
              value: '0.25',
              desc: 'Threshold for valid detections',
            },
          ].map(({ id, label, value, desc }) => (
            <div
              key={id}
              id={id}
              className="bg-white border border-[#c8c7b8] p-4"
              style={{ borderTop: '4px solid #4b5320' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#77786b]">
                {label}
              </p>
              <p className="text-2xl font-extrabold text-[#343c0a] mt-1">{value}</p>
              <p className="text-xs text-[#47483c] mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
