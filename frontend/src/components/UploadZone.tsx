'use client'

/**
 * UploadZone – Drag-and-drop / click-to-upload image input
 *
 * Design: Dashed 2px border (#c8c7b8), light gray bg (#f3f4f5).
 * Highlights olive-green on drag-over.
 * Cloud upload icon, "SECURE IMAGERY TRANSFER" heading, olive CTA button.
 */

import { useCallback, useRef, useState } from 'react'

/* ── Types ─────────────────────────────────────────────────────────────── */
interface UploadZoneProps {
  /** Called when the user selects or drops a valid image file */
  onFileSelect: (file: File) => void
  /** Pass true to compact the zone after file selection */
  hasFile?: boolean
}

/* ── Allowed types ─────────────────────────────────────── */
// 'image/jpg' is NOT a registered MIME type; the correct type is 'image/jpeg'.
// Browsers always report .jpg files as 'image/jpeg'.
const ALLOWED_TYPES = ['image/jpeg', 'image/png']
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png']

// Maximum upload size – must match backend MAX_FILE_SIZE_BYTES (50 MB)
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024

/* ── Component ─────────────────────────────────────────────────────────── */
export default function UploadZone({ onFileSelect, hasFile }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /* Validate and propagate the selected file */
  const handleFile = useCallback(
    (file: File) => {
      setValidationError(null)
      if (!ALLOWED_TYPES.includes(file.type)) {
        setValidationError('Invalid file type. Please upload a JPG or PNG image.')
        return
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        setValidationError(`File too large. Maximum size is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`)
        return
      }
      onFileSelect(file)
    },
    [onFileSelect],
  )

  /* Drag event handlers */
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  /* Click-to-browse handler */
  const openFileDialog = () => inputRef.current?.click()

  return (
    <div className="p-4 md:p-8">
      {/* ── Drop zone ──────────────────────────────────────────────────── */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload zone – click or drag an image here"
        onClick={openFileDialog}
        onKeyDown={(e) => e.key === 'Enter' && openFileDialog()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          border-2 border-dashed rounded-sm cursor-pointer transition-all duration-200 select-none
          ${isDragging
            ? 'border-[#4b5320] bg-[#dfe8a6]/20 scale-[1.002]'
            : 'border-[#c8c7b8] bg-[#f3f4f5] hover:border-[#4b5320]/60 hover:bg-[#f3f4f5]'
          }
        `}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          id="file-input"
          type="file"
          accept={ALLOWED_EXTS.join(',')}
          className="hidden"
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            // Reset so the same file can be re-selected
            e.target.value = ''
          }}
        />

        <div className="flex flex-col items-center justify-center py-14 md:py-20 px-6 text-center">
          {/* ── Cloud icon ──────────────────────────────────────────────── */}
          {/* Desktop: outline style  |  Mobile: filled olive icon bg */}
          <div className="mb-6">
            {/* Desktop icon */}
            <div className="hidden md:block">
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 18a5 5 0 01-1-9.9V8a6 6 0 0111.8-1H18a5 5 0 010 10H7z"
                  stroke="#4b5320"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 13l-3-3m0 0l-3 3m3-3v8"
                  stroke="#4b5320"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {/* Mobile icon – filled olive square with cloud */}
            <div className="md:hidden">
              <div className="bg-[#4b5320] rounded-xl p-4 inline-flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M7 18a5 5 0 01-1-9.9V8a6 6 0 0111.8-1H18a5 5 0 010 10H7z"
                    fill="white"
                    opacity="0.9"
                  />
                  <path
                    d="M15 13l-3-3m0 0l-3 3m3-3v8"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* ── Heading ─────────────────────────────────────────────────── */}
          <h2 className="text-sm md:text-base font-bold uppercase tracking-widest text-[#343c0a] mb-2">
            Secure Imagery Transfer
          </h2>

          {/* ── Subtitle ────────────────────────────────────────── */}
          <p className="text-xs md:text-sm text-[#47483c] max-w-xs mb-8 leading-relaxed">
            <span className="hidden md:inline">
             Accepted formats: JPG, JPEG, PNG.
             <br />
              Maximum file size: 50 MB.
            </span>
            <span className="md:hidden">
              Supported formats: JPG, PNG.
              Maximum file size: 50 MB.
            </span>
          </p>

          {/* ── CTA Button ──────────────────────────────────────────────── */}
          <button
            type="button"
            id="select-image-btn"
            onClick={(e) => {
              e.stopPropagation()
              openFileDialog()
            }}
            className="
              bg-[#4b5320] text-white text-xs font-bold uppercase tracking-widest
              px-8 py-3 rounded-sm hover:bg-[#343c0a] active:scale-95
              transition-all duration-150 flex items-center gap-2
            "
          >
            {/* File icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            Select Image
          </button>

          {/* ── Drag hint ───────────────────────────────────────────────── */}
          <p className="mt-4 text-[10px] uppercase tracking-widest text-[#77786b]">
            or drag and drop secure files here
          </p>
        </div>
      </div>

      {/* ── Validation error ────────────────────────────────────────────── */}
      {validationError && (
        <div
          role="alert"
          className="mt-3 px-4 py-2.5 bg-[#ffdad6] border border-[#ba1a1a] rounded-sm text-[#93000a] text-xs font-medium"
        >
          ⚠ {validationError}
        </div>
      )}
    </div>
  )
}
