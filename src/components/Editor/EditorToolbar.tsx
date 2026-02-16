import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExportMenu } from '@/components/ExportMenu/ExportMenu'
import { ShareModal } from '@/components/Share/ShareModal'
import type { MarkpadDocument } from '@/types'

interface EditorToolbarProps {
  title: string
  mode: 'visual' | 'source'
  onModeChange: (mode: 'visual' | 'source') => void
  document: MarkpadDocument
}

export function EditorToolbar({ title, mode, onModeChange, document: doc }: EditorToolbarProps) {
  const navigate = useNavigate()
  const [exportOpen, setExportOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg)] md:flex-row flex-wrap">
        <button
          onClick={() => navigate('/app')}
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md
            text-[var(--color-text-secondary)] hover:text-[var(--color-text)]
            hover:bg-[var(--color-bg-secondary)] transition-colors shrink-0"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 12L6 8l4-4" />
          </svg>
          <span className="hidden md:inline">Back</span>
        </button>

        <span className="text-sm font-medium text-[var(--color-text)] truncate min-w-0 flex-1">
          {title || 'Untitled'}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          <div className="flex rounded-md border border-[var(--color-border)] overflow-hidden">
            <button
              onClick={() => onModeChange('visual')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                mode === 'visual'
                  ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
              }`}
            >
              Visual
            </button>
            <button
              onClick={() => onModeChange('source')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                mode === 'source'
                  ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
              }`}
            >
              Source
            </button>
          </div>

          {/* Share button */}
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border border-[var(--color-border)]
              text-[var(--color-text-secondary)] hover:text-[var(--color-text)]
              hover:bg-[var(--color-bg-secondary)] transition-colors"
            aria-label="Share note"
            title="Share encrypted link"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span className="hidden md:inline">Share</span>
          </button>

          {/* Export button */}
          <div className="relative">
            <button
              onClick={() => setExportOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border border-[var(--color-border)]
                text-[var(--color-text-secondary)] hover:text-[var(--color-text)]
                hover:bg-[var(--color-bg-secondary)] transition-colors"
              aria-label="Export document"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span className="hidden md:inline">Export</span>
            </button>

            {exportOpen && (
              <ExportMenu document={doc} onClose={() => setExportOpen(false)} />
            )}
          </div>
        </div>
      </div>

      {shareOpen && (
        <ShareModal
          markdown={doc.content}
          title={doc.title}
          onClose={() => setShareOpen(false)}
        />
      )}
    </>
  )
}
