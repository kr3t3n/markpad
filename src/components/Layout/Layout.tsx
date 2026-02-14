import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { AppSettings } from '@/types'

interface LayoutProps {
  children: ReactNode
  theme: AppSettings['theme']
  resolvedTheme: 'light' | 'dark'
  setTheme: (t: AppSettings['theme']) => void
}

function ThemeIcon({ resolvedTheme }: { resolvedTheme: 'light' | 'dark' }) {
  if (resolvedTheme === 'dark') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export function Layout({ children, theme, resolvedTheme, setTheme }: LayoutProps) {
  function cycleTheme() {
    const order: AppSettings['theme'][] = ['light', 'dark', 'system']
    const idx = order.indexOf(theme)
    setTheme(order[(idx + 1) % order.length])
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <nav className="no-print flex-shrink-0 z-50 flex h-12 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4">
        <Link
          to="/app"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
        >
          <img
            src={resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-white.png'}
            alt=""
            className="h-5 w-5"
          />
          Markpad
        </Link>

        <div className="flex items-center gap-1">
          <button
            onClick={cycleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)] transition-colors"
            title={`Theme: ${theme}`}
            aria-label={`Current theme: ${theme}. Click to cycle.`}
          >
            <ThemeIcon resolvedTheme={resolvedTheme} />
          </button>

          <Link
            to="/app/settings"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)] transition-colors"
            title="Settings"
            aria-label="Settings"
          >
            <GearIcon />
          </Link>
        </div>
      </nav>

      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  )
}
