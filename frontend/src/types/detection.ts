/**
 * detection.ts – Swarmtally Shared Types
 * =======================================
 * Canonical TypeScript types for the drone detection API.
 *
 * These types mirror the FastAPI response schema in backend/main.py.
 * Import from here rather than redefining in each component.
 */

/**
 * Response returned by POST /detect (via the Next.js /api/detect proxy).
 * Matches the JSONResponse returned by the FastAPI backend.
 */
export interface DetectionResult {
  /** Total number of drones detected in the image */
  drone_count: number

  /** Confidence scores (0–1) for each detected drone, ordered by detection */
  confidences?: number[]

  /**
   * Relative URL path to the annotated result image served by the backend.
   * Example: "/outputs/result_abc123.jpg"
   * Prefix with NEXT_PUBLIC_API_URL to get the full URL.
   */
  processed_image_url: string

  /** Time taken for YOLOv8 inference in milliseconds */
  inference_ms?: number
}

/**
 * Error response returned by the Next.js API proxy on failure.
 * Wraps both backend errors (relayed) and proxy-level network errors.
 */
export interface ApiError {
  error: string
}

/**
 * Possible states for the detection workflow in the UI.
 */
export type DetectionStatus = 'idle' | 'uploading' | 'detecting' | 'success' | 'error'

/**
 * Threat level classification based on drone count.
 * Matches the badge labels in results/page.tsx.
 */
export type ThreatLevel = 'area-clear' | 'single-contact' | 'multiple-contacts' | 'swarm-detected'

/**
 * Derive a threat level label from a drone count.
 */
export function getThreatLevel(droneCount: number): ThreatLevel {
  if (droneCount === 0) return 'area-clear'
  if (droneCount === 1) return 'single-contact'
  if (droneCount < 5) return 'multiple-contacts'
  return 'swarm-detected'
}

/**
 * Human-readable label for a ThreatLevel.
 */
export const THREAT_LABELS: Record<ThreatLevel, string> = {
  'area-clear':         'Area Clear',
  'single-contact':    'Single Contact',
  'multiple-contacts': 'Multiple Contacts',
  'swarm-detected':    'Swarm Detected',
}
