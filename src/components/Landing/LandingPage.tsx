interface LandingPageProps {
  resolvedTheme: 'light' | 'dark'
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 transition-all hover:border-[var(--color-text-tertiary)]">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] transition-colors group-hover:text-[var(--color-text)]">
        {icon}
      </div>
      <h3 className="mb-1 text-base font-semibold text-[var(--color-text)]">{title}</h3>
      <p className="text-sm leading-snug text-[var(--color-text-secondary)]">{description}</p>
    </div>
  )
}

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function WifiOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  )
}

export function LandingPage({ resolvedTheme }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-12 pb-8 text-center sm:pt-16 sm:pb-10">
        <img
          src={resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-white.png'}
          alt="Markpad"
          className="mb-4 h-16 w-16 sm:h-20 sm:w-20"
        />
        <h1 className="mb-1 text-4xl font-bold tracking-tight sm:text-5xl">
          Markpad
        </h1>
        <p className="mb-4 text-xs font-medium tracking-widest uppercase text-[var(--color-text-tertiary)]">
          Simple and beautiful markdown editor
        </p>
        <p className="mx-auto mb-6 max-w-lg text-base text-[var(--color-text-secondary)] sm:text-lg">
          A free, private markdown editor that lives in your browser
        </p>
        <a
          href="/app"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-6 py-2.5 text-base font-medium text-[var(--color-bg)] transition-all hover:bg-[var(--color-accent-hover)]"
        >
          Open Markpad
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-4xl px-4 pb-10">
        <div className="grid gap-4 sm:grid-cols-2">
          <FeatureCard
            icon={<EditIcon />}
            title="Rich Text Editing"
            description="Write naturally with a visual editor, powered by markdown under the hood."
          />
          <FeatureCard
            icon={<LockIcon />}
            title="100% Private"
            description="Your data never leaves your browser. No accounts, no servers, no tracking."
          />
          <FeatureCard
            icon={<DownloadIcon />}
            title="Export Anywhere"
            description="Download as .md, .docx, or open directly in Google Docs."
          />
          <FeatureCard
            icon={<WifiOffIcon />}
            title="Works Offline"
            description="Install as an app. Create and edit documents without internet."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] px-4 py-5 text-center text-sm text-[var(--color-text-tertiary)]">
        <div className="flex items-center justify-center gap-4 mb-3">
          <a
            href="https://github.com/kr3t3n"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors"
            aria-label="GitHub"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <a
            href="https://x.com/georgipep"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors"
            aria-label="X (Twitter)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://buymeacoffee.com/georgipep"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Buy Me a Coffee"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
          </a>
        </div>
        <div className="flex items-center justify-center gap-3 text-xs">
          <span>Made by Georgi Pepelyankov</span>
          <span className="text-[var(--color-border)]">&middot;</span>
          <a href="/terms" className="hover:text-[var(--color-text)] transition-colors">Terms</a>
          <span className="text-[var(--color-border)]">&middot;</span>
          <a href="/privacy" className="hover:text-[var(--color-text)] transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  )
}
