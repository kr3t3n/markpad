import { Link } from 'react-router-dom'

export function TermsPage() {
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

        <h1 className="mb-2 text-3xl font-bold tracking-tight">Terms &amp; Conditions</h1>
        <p className="mb-8 text-sm text-[var(--color-text-tertiary)]">Last updated: February 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Markpad ("the Service"), you agree to be bound by these Terms &amp; Conditions. If you do not agree with any part of these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">2. Description of Service</h2>
            <p>
              Markpad is a free, browser-based markdown editor. The Service runs entirely on your device. All documents and data are stored locally in your browser using IndexedDB. No data is transmitted to or stored on any server.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">3. User Data</h2>
            <p>
              Your documents and settings are stored exclusively in your browser's local storage. We do not collect, transmit, or have access to any of your content. You are solely responsible for backing up your data. Clearing your browser data or uninstalling the application will permanently delete all locally stored documents.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">4. Intellectual Property</h2>
            <p>
              The Markpad application, its source code, design, and branding are the property of Georgi Pepelyankov. The application is open source and available under the terms specified in the project repository. Your content created using Markpad remains entirely your own.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">5. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or that data loss will not occur. Use the Service at your own risk.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">6. Limitation of Liability</h2>
            <p>
              In no event shall Georgi Pepelyankov or contributors be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, arising out of or in connection with your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">7. Third-Party Services</h2>
            <p>
              Markpad offers export functionality to third-party services such as Google Docs. Your use of those services is governed by their respective terms and privacy policies. We are not responsible for any third-party service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be reflected on this page with an updated date. Continued use of the Service after changes constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">9. Contact</h2>
            <p>
              For questions about these terms, reach out via{' '}
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
