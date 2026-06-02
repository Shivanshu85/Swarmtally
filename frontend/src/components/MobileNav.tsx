'use client'

/**
 * MobileNav – Fixed bottom navigation bar (mobile only, hidden on md+)
 *
 * Design: White bg, 1px top border. Two tab items: Dashboard and Results.
 * Active tab uses olive green color. Matches the mobile screen designs.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#c8c7b8] z-50"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex">
        {/* ── Dashboard Tab ──────────────────────────────── */}
        <MobileNavTab
          href="/"
          active={pathname === '/'}
          label="Dashboard"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="3" y="3" width="8" height="8" rx="1" />
              <rect x="13" y="3" width="8" height="8" rx="1" />
              <rect x="3" y="13" width="8" height="8" rx="1" />
              <rect x="13" y="13" width="8" height="8" rx="1" />
            </svg>
          }
        />

        {/* ── Results Tab ────────────────────────────────── */}
        <MobileNavTab
          href="/results"
          active={pathname === '/results'}
          label="Results"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="8" y1="9" x2="16" y2="9" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="12" y2="17" />
            </svg>
          }
        />
      </div>
    </nav>
  )
}

/* ── MobileNavTab helper ─────────────────────────────────────────────────── */
function MobileNavTab({
  href,
  active,
  label,
  icon,
}: {
  href: string
  active: boolean
  label: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`
        flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors
        ${active ? 'text-[#4b5320]' : 'text-[#77786b]'}
      `}
      aria-current={active ? 'page' : undefined}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </Link>
  )
}
