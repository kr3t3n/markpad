import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MarkpadDocument, Tag } from '@/types'

function relativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

interface DocumentCardProps {
  document: MarkpadDocument
  tags: Tag[]
  folders: { id: string; name: string }[]
  selected?: boolean
  selectionActive?: boolean
  onSelect?: (id: string, e: React.MouseEvent) => void
  onRename: (id: string, title: string) => void
  onDuplicate: (id: string) => void
  onMove: (id: string, folderId: string | null) => void
  onDelete: (id: string) => void
  onBulkAction?: (action: 'delete' | 'move' | 'duplicate', ids: string[]) => void
  selectedIds?: string[]
}

export function DocumentCard({
  document: doc,
  tags,
  folders,
  selected = false,
  selectionActive = false,
  onSelect,
  onRename,
  onDuplicate,
  onMove,
  onDelete,
  onBulkAction,
  selectedIds = [],
}: DocumentCardProps) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [moveMenuOpen, setMoveMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(doc.title)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isPartOfSelection = selected && selectedIds.length > 1

  useEffect(() => {
    if (renaming) inputRef.current?.focus()
  }, [renaming])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setMoveMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const preview = doc.content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~`>\[\]()!|\\-]/g, '')
    .slice(0, 100)
    .trim()

  const docTags = tags.filter(t => doc.tags.includes(t.name))

  function commitRename() {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== doc.title) {
      onRename(doc.id, trimmed)
    } else {
      setRenameValue(doc.title)
    }
    setRenaming(false)
  }

  const deleteCount = isPartOfSelection ? selectedIds.length : 1

  return (
    <div
      draggable={!renaming}
      onDragStart={e => {
        // If this card is selected and part of multi-select, drag all selected
        if (selected && selectedIds.length > 1) {
          e.dataTransfer.setData('application/markpad-doc-ids', JSON.stringify(selectedIds))
        } else {
          e.dataTransfer.setData('application/markpad-doc-id', doc.id)
        }
        e.dataTransfer.effectAllowed = 'move'
      }}
      className={`group relative flex flex-col rounded-lg border p-4 transition-shadow cursor-pointer ${
        selected
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 shadow-md ring-1 ring-[var(--color-accent)]/30'
          : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:shadow-md'
      }`}
      onClick={e => {
        if (renaming || menuOpen || confirmDelete) return
        // If shift/cmd held or selection is active, toggle selection
        if (e.shiftKey || e.metaKey || e.ctrlKey || selectionActive) {
          onSelect?.(doc.id, e)
          return
        }
        navigate(`/app/doc/${doc.id}`)
      }}
      onContextMenu={e => {
        e.preventDefault()
        setMenuOpen(true)
      }}
    >
      {/* Checkbox - shown on hover or when selection is active */}
      <div
        className={`absolute left-2 top-2 z-10 transition-opacity ${
          selected || selectionActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <button
          className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
            selected
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
              : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-accent)]'
          }`}
          onClick={e => {
            e.stopPropagation()
            onSelect?.(doc.id, e)
          }}
          aria-label={selected ? 'Deselect document' : 'Select document'}
        >
          {selected && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      </div>

      {/* Title */}
      {renaming ? (
        <input
          ref={inputRef}
          className="mb-1 rounded border border-[var(--color-accent)] bg-[var(--color-bg)] px-1 py-0.5 text-sm font-semibold text-[var(--color-text)] outline-none"
          value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={e => {
            if (e.key === 'Enter') commitRename()
            if (e.key === 'Escape') {
              setRenameValue(doc.title)
              setRenaming(false)
            }
          }}
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <h3 className="mb-1 truncate text-sm font-semibold text-[var(--color-text)]">
          {doc.title}
        </h3>
      )}

      {/* Preview */}
      <p className="mb-3 line-clamp-2 flex-1 text-xs text-[var(--color-text-secondary)]">
        {preview || 'Empty document'}
      </p>

      {/* Tags */}
      {docTags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {docTags.map(t => (
            <span
              key={t.id}
              className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: t.color }}
            >
              {t.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-[var(--color-text-tertiary)]">
        <span>{relativeTime(doc.updatedAt)}</span>
      </div>

      {/* Three-dot menu button */}
      <button
        className="absolute right-2 top-2 rounded p-1 text-[var(--color-text-tertiary)] opacity-0 transition-opacity hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text)] group-hover:opacity-100"
        onClick={e => {
          e.stopPropagation()
          setMenuOpen(prev => !prev)
        }}
        aria-label="Document options"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>

      {/* Context menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-2 top-9 z-20 min-w-[160px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] py-1 shadow-lg"
          onClick={e => e.stopPropagation()}
        >
          {/* Show bulk header if multiple selected */}
          {isPartOfSelection && (
            <>
              <div className="px-3 py-1 text-xs font-medium text-[var(--color-text-tertiary)]">
                {selectedIds.length} documents selected
              </div>
              <hr className="my-1 border-[var(--color-border)]" />
            </>
          )}
          {!isPartOfSelection && (
            <>
              <button
                className="w-full px-3 py-1.5 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
                onClick={() => {
                  setMenuOpen(false)
                  setRenaming(true)
                }}
              >
                Rename
              </button>
              <button
                className="w-full px-3 py-1.5 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
                onClick={() => {
                  onDuplicate(doc.id)
                  setMenuOpen(false)
                }}
              >
                Duplicate
              </button>
            </>
          )}
          <div className="relative">
            <button
              className="w-full px-3 py-1.5 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
              onClick={() => setMoveMenuOpen(prev => !prev)}
            >
              Move to folder{isPartOfSelection ? ` (${selectedIds.length})` : ''}
            </button>
            {moveMenuOpen && (
              <div className="absolute left-full top-0 z-30 ml-1 min-w-[140px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] py-1 shadow-lg">
                <button
                  className="w-full px-3 py-1.5 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
                  onClick={() => {
                    if (isPartOfSelection && onBulkAction) {
                      // Move all selected to root
                      for (const id of selectedIds) onMove(id, null)
                    } else {
                      onMove(doc.id, null)
                    }
                    setMenuOpen(false)
                    setMoveMenuOpen(false)
                  }}
                >
                  Root (no folder)
                </button>
                {folders.map(f => (
                  <button
                    key={f.id}
                    className="w-full px-3 py-1.5 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
                    onClick={() => {
                      if (isPartOfSelection) {
                        for (const id of selectedIds) onMove(id, f.id)
                      } else {
                        onMove(doc.id, f.id)
                      }
                      setMenuOpen(false)
                      setMoveMenuOpen(false)
                    }}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <hr className="my-1 border-[var(--color-border)]" />
          <button
            className="w-full px-3 py-1.5 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-bg-secondary)]"
            onClick={() => {
              setMenuOpen(false)
              setConfirmDelete(true)
            }}
          >
            Delete{isPartOfSelection ? ` (${selectedIds.length})` : ''}
          </button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={e => {
            e.stopPropagation()
            setConfirmDelete(false)
          }}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h4 className="mb-2 text-sm font-semibold text-[var(--color-text)]">
              Delete {deleteCount > 1 ? `${deleteCount} documents` : 'document'}?
            </h4>
            <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
              {deleteCount > 1
                ? `${deleteCount} documents will be permanently deleted. This cannot be undone.`
                : `"${doc.title}" will be permanently deleted. This cannot be undone.`}
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="rounded px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                className="rounded bg-[var(--color-danger)] px-3 py-1.5 text-sm text-white hover:opacity-90"
                onClick={() => {
                  if (isPartOfSelection) {
                    for (const id of selectedIds) onDelete(id)
                  } else {
                    onDelete(doc.id)
                  }
                  setConfirmDelete(false)
                }}
              >
                Delete{deleteCount > 1 ? ` (${deleteCount})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
