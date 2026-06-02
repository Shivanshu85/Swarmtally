import type { Metadata, Viewport } from 'next'
import './globals.css'

/* ── SEO Metadata ─────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: 'Swarmtally – Drone Detection & Counting System',
  description:
    'AI-powered drone detection and counting system using YOLOv8. Upload aerial imagery for automated threat analysis and swarm quantification.',
  keywords: [
    'drone detection',
    'YOLOv8',
    'AI',
    'computer vision',
    'swarm detection',
    'aerial surveillance',
  ].join(', '),
  authors: [{ name: 'Swarmtally' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-inter antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
