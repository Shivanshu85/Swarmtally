'use client'

/**
 * Navbar – Desktop navigation bar
 *
 * Design: White background, 1px bottom border (outline-variant),
 * logo left-aligned with shield icon, links right-aligned.
 * Active link has a 2px olive underline.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav
      className="bg-white border-b border-[#c8c7b8] sticky top-0 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-10 flex items-center justify-between h-14">
        {/* ── Logo ──────────────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="Swarmtally – Home"
        >
          {/* Shield icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="flex-shrink-0"
          >
            <path
              d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z"
              fill="#4b5320"
            />
          </svg>
          <span className="text-[#343c0a] font-extrabold text-base uppercase tracking-tight group-hover:text-[#4b5320] transition-colors">
            Swarmtally
          </span>
        </Link>

        {/* ── Desktop Nav Links ──────────────────────────── */}
        <div className="hidden md:flex items-center gap-8" role="menubar">
          <NavLink href="/" active={pathname === '/'} label="Dashboard" />
          <NavLink href="/results" active={pathname === '/results'} label="Results" />
        </div>
      </div>
    </nav>
  )
}

/* ── NavLink helper ──────────────────────────────────────────────────────── */
function NavLink({
  href,
  active,
  label,
}: {
  href: string
  active: boolean
  label: string
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className={`
        text-xs font-bold uppercase tracking-widest transition-colors pb-0.5
        ${active
          ? 'text-[#343c0a] border-b-2 border-[#4b5320]'
          : 'text-[#47483c] hover:text-[#343c0a] border-b-2 border-transparent'
        }
      `}
    >
      {label}
    </Link>
  )
}
