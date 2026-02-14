import { Link } from 'react-router-dom'

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </Link>

        <h1 className="mb-2 text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mb-8 text-sm text-[var(--color-text-tertiary)]">Last updated: February 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">The Short Version</h2>
            <p>
              Markpad does not collect, store, or transmit any of your data. Everything stays in your browser. That's it.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">Data Storage</h2>
            <p>
              All documents, folders, tags, and settings are stored locally in your browser using IndexedDB. No data is sent to any server, API, or third-party service during normal use. Your content never leaves your device.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">No Accounts</h2>
            <p>
              Markpad does not require or offer user accounts. There is no sign-up, login, or authentication of any kind. You use the application anonymously.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">No Analytics or Tracking</h2>
            <p>
              We do not use any analytics services, tracking pixels, cookies, or fingerprinting. No usage data, behavioural data, or personal information is collected. There are no third-party scripts monitoring your activity.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">No Cookies</h2>
            <p>
              Markpad does not set any cookies. Your theme preference and application settings are stored in IndexedDB alongside your documents, never in cookies.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">Export Features</h2>
            <p>
              When you use the export-to-Google-Docs feature, your document content is sent directly from your browser to Google's servers using their API. This is initiated by you and governed by Google's privacy policy. No data passes through our servers.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">Hosting</h2>
            <p>
              Markpad is hosted on Netlify. Netlify may collect standard server logs (IP addresses, request timestamps) as part of serving the application. This is standard web hosting behaviour and is governed by{' '}
              <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-text)]">
                Netlify's privacy policy
              </a>. We do not have access to these logs.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">Data Deletion</h2>
            <p>
              Since all data is stored locally, you have full control. Clear your browser data for markpad.online, or use the backup/restore feature in Settings to manage your data. Uninstalling the PWA will also remove all stored data.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">Changes to This Policy</h2>
            <p>
              If we ever change how data is handled, this page will be updated with the new date. Given the architecture of Markpad (fully client-side), significant changes are unlikely.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">Contact</h2>
            <p>
              Questions about privacy? Reach out via{' '}
              <a href="https://github.com/kr3t3n/markpad" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-text)]">
                GitHub
              </a>
              {' '}or{' '}
              <a href="https://x.com/georgipep" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-text)]">
                X (@georgipep)
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
