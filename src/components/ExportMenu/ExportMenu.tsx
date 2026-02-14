import { useState, useRef, useEffect, useCallback } from 'react'
import { exportAsMarkdown, exportAsText, exportAsDocx, exportToGoogleDocs } from '@/lib/export'
import type { MarkpadDocument } from '@/types'

interface ExportMenuProps {
  document: MarkpadDocument
  onClose?: () => void
}

export function ExportMenu({ document: doc, onClose }: ExportMenuProps) {
  const [showTemplateMenu, setShowTemplateMenu] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [overlay, setOverlay] = useState<string | null>(null)
  const [overlayFading, setOverlayFading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const dismissOverlay = useCallback(() => {
    setOverlayFading(true)
    setTimeout(() => {
      setOverlay(null)
      setOverlayFading(false)
      onClose?.()
    }, 300)
  }, [onClose])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose?.()
      }
    }
    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  async function handleExport(format: string, template?: string) {
    setExporting(true)
    setMessage(null)
    try {
      switch (format) {
        case 'md':
          exportAsMarkdown(doc)
          break
        case 'txt':
          exportAsText(doc)
          break
        case 'docx':
          await exportAsDocx(doc, template)
          break
        case 'gdocs': {
          const msg = await exportToGoogleDocs(doc)
          setOverlay(msg)
          break
        }
      }
    } catch (err) {
      setMessage(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setExporting(false)
      setShowTemplateMenu(false)
    }
  }

  return (
    <>
    {overlay && (
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-pointer transition-opacity duration-300 ${overlayFading ? 'opacity-0' : 'opacity-100'}`}
        onClick={dismissOverlay}
      >
        <div className="mx-4 max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-8 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
          <div className="mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </div>
          <p className="text-lg font-medium text-[var(--color-text)]">{overlay}</p>
          <p className="mt-3 text-sm text-[var(--color-text-tertiary)]">Click anywhere to dismiss</p>
        </div>
      </div>
    )}
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-1 z-50 w-64 rounded-lg border shadow-lg
                 bg-[var(--color-bg)] border-[var(--color-border)]"
    >
      {message && (
        <div className="px-4 py-2 text-sm border-b border-[var(--color-border)] text-[var(--color-accent)]">
          {message}
        </div>
      )}

      <div className="py-1">
        <button
          onClick={() => handleExport('md')}
          disabled={exporting}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                     text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)]
                     disabled:opacity-50 transition-colors"
        >
          <span className="text-lg">📝</span>
          <div>
            <div className="font-medium">Markdown</div>
            <div className="text-xs text-[var(--color-text-tertiary)]">.md file</div>
          </div>
        </button>

        <button
          onClick={() => handleExport('txt')}
          disabled={exporting}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                     text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)]
                     disabled:opacity-50 transition-colors"
        >
          <span className="text-lg">📄</span>
          <div>
            <div className="font-medium">Plain Text</div>
            <div className="text-xs text-[var(--color-text-tertiary)]">.txt file</div>
          </div>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowTemplateMenu(!showTemplateMenu)}
            disabled={exporting}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                       text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)]
                       disabled:opacity-50 transition-colors"
          >
            <span className="text-lg">📘</span>
            <div className="flex-1">
              <div className="font-medium">Word Document</div>
              <div className="text-xs text-[var(--color-text-tertiary)]">.docx file</div>
            </div>
            <svg className={`w-4 h-4 transition-transform ${showTemplateMenu ? 'rotate-90' : ''}`}
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {showTemplateMenu && (
            <div className="ml-8 border-l border-[var(--color-border)]">
              <button
                onClick={() => handleExport('docx', 'default')}
                disabled={exporting}
                className="w-full px-4 py-2 text-sm text-left text-[var(--color-text)]
                           hover:bg-[var(--color-bg-tertiary)] transition-colors"
              >
                No template (Calibri)
              </button>
              <button
                onClick={() => handleExport('docx', 'professional')}
                disabled={exporting}
                className="w-full px-4 py-2 text-sm text-left text-[var(--color-text)]
                           hover:bg-[var(--color-bg-tertiary)] transition-colors"
              >
                Professional (Garamond)
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--color-border)] my-1" />

        <button
          onClick={() => handleExport('gdocs')}
          disabled={exporting}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left
                     text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)]
                     disabled:opacity-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <div className="font-medium">Google Docs</div>
            <div className="text-xs text-[var(--color-text-tertiary)]">Open in browser</div>
          </div>
        </button>
      </div>

      {exporting && (
        <div className="px-4 py-2 text-xs text-center text-[var(--color-text-tertiary)] border-t border-[var(--color-border)]">
          Exporting...
        </div>
      )}
    </div>
    </>
  )
}
