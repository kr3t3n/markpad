import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { AppSettings } from '@/types'
import { exportWorkspaceBackup, importWorkspaceBackup } from '@/lib/backup'

interface SettingsPageProps {
  theme: AppSettings['theme']
  setTheme: (t: AppSettings['theme']) => void
}

type ImportMode = 'merge' | 'replace'

export function SettingsPage({ theme, setTheme }: SettingsPageProps) {
  const [importMode, setImportMode] = useState<ImportMode>('merge')
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [exportStatus, setExportStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingFileRef = useRef<File | null>(null)

  async function handleExport() {
    try {
      setExportStatus(null)
      await exportWorkspaceBackup()
      setExportStatus('Backup exported successfully.')
    } catch {
      setExportStatus('Export failed. Please try again.')
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    pendingFileRef.current = file
    setShowImportDialog(true)
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function confirmImport() {
    const file = pendingFileRef.current
    if (!file) return
    setShowImportDialog(false)
    setImportStatus(null)
    try {
      await importWorkspaceBackup(file, importMode === 'merge')
      setImportStatus('Backup imported successfully.')
    } catch {
      setImportStatus('Import failed. The file may be invalid.')
    }
    pendingFileRef.current = null
  }

  function cancelImport() {
    setShowImportDialog(false)
    pendingFileRef.current = null
  }

  const themeOptions: { value: AppSettings['theme']; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ]

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      {/* Back */}
      <Link
        to="/app"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back
      </Link>

      <h1 className="mb-8 text-2xl font-bold text-[var(--color-text)]">Settings</h1>

      {/* Theme */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Theme
        </h2>
        <div className="flex rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-1">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                theme === opt.value
                  ? 'bg-[var(--color-accent)] text-[var(--color-bg)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Backup */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Backup
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Export Backup
            </button>
            {exportStatus && (
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{exportStatus}</p>
            )}
          </div>

          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Import Backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            {importStatus && (
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{importStatus}</p>
            )}
          </div>
        </div>
      </section>

      {/* Import dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Import Backup</h3>
            <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
              How should the imported data be handled?
            </p>
            <div className="mb-5 space-y-2">
              <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="accent-[var(--color-accent)]"
                />
                Merge with existing data
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="accent-[var(--color-accent)]"
                />
                Replace all data
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelImport}
                className="rounded-lg px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmImport}
                className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-bg)] hover:opacity-90 transition-opacity"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          About
        </h2>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
          <p className="text-sm font-medium text-[var(--color-text)]">Markpad v0.1.0</p>
          <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">Simple and beautiful markdown editor</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Made by Georgi Pepelyankov
          </p>
          <div className="mt-3 flex items-center gap-4">
            <a
              href="https://github.com/kr3t3n"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              title="GitHub"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              kr3t3n
            </a>
            <a
              href="https://x.com/georgipep"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              title="X"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              georgipep
            </a>
            <a
              href="https://buymeacoffee.com/georgipep"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              title="Buy Me a Coffee"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                <line x1="6" y1="1" x2="6" y2="4"/>
                <line x1="10" y1="1" x2="10" y2="4"/>
                <line x1="14" y1="1" x2="14" y2="4"/>
              </svg>
              Buy Me a Coffee
            </a>
          </div>
          <div className="mt-3 flex items-center gap-3 border-t border-[var(--color-border)] pt-3">
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors"
            >
              Terms &amp; Conditions
            </a>
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
