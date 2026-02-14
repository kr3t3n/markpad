import { useState, useEffect } from 'react'
import { getSettings, updateSettings } from '@/lib/storage'
import { getAllDocuments, createDocument } from '@/lib/storage'

const SAMPLE_DOC_CONTENT = `# Welcome to Markpad

This is your first document. Markpad is a **free, private** markdown editor.

## What you can do

- **Bold**, *italic*, and ~~strikethrough~~ text
- Headings from H1 to H6
- Bullet and numbered lists
- [x] Task lists with checkboxes
- [ ] Like this unchecked one
- \`Inline code\` and code blocks
- > Blockquotes
- Tables, horizontal rules, and more

## Export your work

Click the export button to save as:
- \`.md\` — Markdown file
- \`.txt\` — Plain text
- \`.docx\` — Word document
- **Google Docs** — Open directly in Google Docs

---

*Delete this document anytime. Happy writing!*`

function TipIcon({ type }: { type: 'edit' | 'lock' | 'download' | 'offline' }) {
  const shared = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (type) {
    case 'edit':
      return (
        <svg {...shared}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      )
    case 'lock':
      return (
        <svg {...shared}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    case 'download':
      return (
        <svg {...shared}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      )
    case 'offline':
      return (
        <svg {...shared}>
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
}

interface OnboardingModalProps {
  onDismiss: () => void
}

export function OnboardingModal({ onDismiss }: OnboardingModalProps) {
  const [visible, setVisible] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(true)

  useEffect(() => {
    getSettings().then((s) => {
      if (!s.onboardingDismissed) {
        setVisible(true)
      }
    })
  }, [])

  async function handleDismiss() {
    if (dontShowAgain) {
      await updateSettings({ onboardingDismissed: true })
    }

    // Create sample document if no documents exist
    const docs = await getAllDocuments()
    if (docs.length === 0) {
      await createDocument({
        title: 'Welcome to Markpad',
        content: SAMPLE_DOC_CONTENT,
      })
    }

    setVisible(false)
    onDismiss()
  }

  if (!visible) return null

  const tips = [
    { icon: 'edit' as const, text: 'Create documents with full markdown formatting' },
    { icon: 'lock' as const, text: 'Everything is saved locally \u2014 your data never leaves your browser' },
    { icon: 'download' as const, text: 'Export to .md, .docx, or Google Docs anytime' },
    { icon: 'offline' as const, text: 'Works offline \u2014 install as an app from your browser' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-xl">
        <h2 className="mb-1 text-xl font-bold text-[var(--color-text)]">
          Welcome to Markpad
        </h2>
        <p className="mb-5 text-sm text-[var(--color-text-secondary)]">
          A free, private markdown editor in your browser.
        </p>

        <ul className="mb-6 space-y-3">
          {tips.map((tip) => (
            <li key={tip.icon} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                <TipIcon type={tip.icon} />
              </span>
              <span className="text-sm leading-relaxed text-[var(--color-text)]">{tip.text}</span>
            </li>
          ))}
        </ul>

        <label className="mb-5 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="accent-[var(--color-accent)]"
          />
          Don't show this again
        </label>

        <button
          onClick={handleDismiss}
          className="w-full rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-bg)] shadow-sm hover:opacity-90 transition-opacity"
        >
          Get Started
        </button>
      </div>
    </div>
  )
}
