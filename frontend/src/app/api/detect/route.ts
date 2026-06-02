import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js API Route – POST /api/detect
 *
 * Acts as a server-side proxy between the Next.js frontend and the
 * FastAPI backend. This pattern:
 *  1. Hides the backend URL from the browser (useful for production)
 *  2. Avoids CORS preflight issues
 *  3. Allows adding auth tokens / rate limiting in one place
 *
 * Flow: Browser → POST /api/detect → FastAPI POST /detect → JSON response
 */
export async function POST(request: NextRequest) {
  // Backend URL is set via the API_URL environment variable (server-side only)
  const backendUrl = process.env.API_URL ?? 'http://localhost:8000'

  try {
    // ── Forward the multipart/form-data to FastAPI ──────────────────────
    // We read the FormData from the incoming request and pass it directly
    // to fetch(). fetch() will set the correct Content-Type with boundary.
    const formData = await request.formData()

    const backendResponse = await fetch(`${backendUrl}/detect`, {
      method: 'POST',
      body: formData,
      // Do NOT manually set Content-Type – let the browser/Node handle it
    })

    // ── Parse FastAPI response ──────────────────────────────────────────
    const data = await backendResponse.json()

    if (!backendResponse.ok) {
      // Relay the FastAPI error detail to the frontend
      return NextResponse.json(
        { error: data?.detail ?? 'Detection failed on the backend.' },
        { status: backendResponse.status },
      )
    }

    // ── Return success response ─────────────────────────────────────────
    return NextResponse.json(data, { status: 200 })
  } catch (err: unknown) {
    console.error('[Swarmtally API] Proxy error:', err)

    // Network / connection errors
    return NextResponse.json(
      {
        error:
          'Could not connect to the detection service. ' +
          'Make sure the backend is running on http://localhost:8000.',
      },
      { status: 503 },
    )
  }
}
