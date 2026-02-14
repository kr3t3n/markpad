import { useState, useRef, useEffect, useCallback } from 'react'
import type { Folder, Tag } from '@/types'

const MIN_SIDEBAR_WIDTH = 180
const MAX_SIDEBAR_WIDTH = 400
const DEFAULT_SIDEBAR_WIDTH = 240
const STORAGE_KEY = 'markpad-sidebar-width'

function getSavedWidth(): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const w = parseInt(saved, 10)
      if (w >= MIN_SIDEBAR_WIDTH && w <= MAX_SIDEBAR_WIDTH) return w
    }
  } catch {}
  return DEFAULT_SIDEBAR_WIDTH
}

interface FolderSidebarProps {
  folders: Folder[]
  tags: Tag[]
  activeFolderId: string | null | 'all'
  activeTagId: string | null
  onSelectFolder: (folderId: string | null | 'all') => void
  onSelectTag: (tagId: string | null) => void
  onCreateFolder: (name: string, parentId: string | null) => void
  onRenameFolder: (id: string, name: string) => void
  onDeleteFolder: (id: string) => void
  onMoveDocument?: (docId: string, folderId: string | null) => void
  open: boolean
  onClose: () => void
}

interface FolderNodeProps {
  folder: Folder
  children: Folder[]
  allFolders: Folder[]
  activeFolderId: string | null | 'all'
  onSelect: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onCreateChild: (parentId: string) => void
  onMoveDocument?: (docId: string, folderId: string | null) => void
  depth: number
}

function FolderNode({
  folder,
  children,
  allFolders,
  activeFolderId,
  onSelect,
  onRename,
  onDelete,
  onCreateChild,
  onMoveDocument,
  depth,
}: FolderNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(folder.name)
  const [dragOver, setDragOver] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isActive = activeFolderId === folder.id

  useEffect(() => {
    if (renaming) inputRef.current?.focus()
  }, [renaming])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  function commitRename() {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== folder.name) {
      onRename(folder.id, trimmed)
    } else {
      setRenameValue(folder.name)
    }
    setRenaming(false)
  }

  return (
    <div>
      <div
        className={`group relative flex items-center gap-1 rounded px-2 py-1 text-sm cursor-pointer transition-colors ${
          dragOver
            ? 'bg-[var(--color-accent)]/20 ring-2 ring-[var(--color-accent)] ring-inset'
            : isActive
              ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(folder.id)}
        onContextMenu={e => {
          e.preventDefault()
          setMenuOpen(true)
        }}
        onDragOver={e => {
          if (e.dataTransfer.types.includes('application/markpad-doc-id')) {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
            setDragOver(true)
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault()
          setDragOver(false)
          const docId = e.dataTransfer.getData('application/markpad-doc-id')
          if (docId && onMoveDocument) {
            onMoveDocument(docId, folder.id)
          }
        }}
      >
        {children.length > 0 && (
          <button
            className="flex-shrink-0 p-0.5"
            onClick={e => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="currentColor"
              className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
            >
              <path d="M4 2l4 4-4 4z" />
            </svg>
          </button>
        )}
        {children.length === 0 && <span className="w-[16px]" />}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
        {renaming ? (
          <input
            ref={inputRef}
            className="flex-1 rounded border border-[var(--color-accent)] bg-[var(--color-bg)] px-1 py-0.5 text-sm text-[var(--color-text)] outline-none"
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') {
                setRenameValue(folder.name)
                setRenaming(false)
              }
            }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate">{folder.name}</span>
        )}
        <button
          className="flex-shrink-0 rounded p-0.5 opacity-0 hover:bg-[var(--color-bg-tertiary)] group-hover:opacity-100"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(prev => !prev)
          }}
          aria-label="Folder options"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>
        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute right-2 top-full z-30 mt-1 min-w-[120px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] py-1 shadow-lg"
            onClick={e => e.stopPropagation()}
          >
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
                setMenuOpen(false)
                onCreateChild(folder.id)
              }}
            >
              New subfolder
            </button>
            <hr className="my-1 border-[var(--color-border)]" />
            <button
              className="w-full px-3 py-1.5 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-bg-secondary)]"
              onClick={() => {
                setMenuOpen(false)
                onDelete(folder.id)
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
      {expanded &&
        children.map(child => (
          <FolderNode
            key={child.id}
            folder={child}
            children={allFolders.filter(f => f.parentId === child.id)}
            allFolders={allFolders}
            activeFolderId={activeFolderId}
            onSelect={onSelect}
            onRename={onRename}
            onDelete={onDelete}
            onCreateChild={onCreateChild}
            onMoveDocument={onMoveDocument}
            depth={depth + 1}
          />
        ))}
    </div>
  )
}

export function FolderSidebar({
  folders,
  tags,
  activeFolderId,
  activeTagId,
  onSelectFolder,
  onSelectTag,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveDocument,
  open,
  onClose,
}: FolderSidebarProps) {
  const [sidebarWidth, setSidebarWidth] = useState(getSavedWidth)
  const isResizing = useRef(false)
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [dragOverUnfiled, setDragOverUnfiled] = useState(false)
  const newFolderRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (creatingFolder) newFolderRef.current?.focus()
  }, [creatingFolder])

  function submitNewFolder() {
    const trimmed = newFolderName.trim()
    if (trimmed) {
      onCreateFolder(trimmed, newFolderParentId)
    }
    setCreatingFolder(false)
    setNewFolderName('')
    setNewFolderParentId(null)
  }

  function startCreateChild(parentId: string) {
    setNewFolderParentId(parentId)
    setCreatingFolder(true)
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isResizing.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const startX = e.clientX
    const startWidth = sidebarWidth

    function onMouseMove(ev: MouseEvent) {
      if (!isResizing.current) return
      const newWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, startWidth + ev.clientX - startX))
      setSidebarWidth(newWidth)
    }

    function onMouseUp() {
      isResizing.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      setSidebarWidth(w => {
        try { localStorage.setItem(STORAGE_KEY, String(w)) } catch {}
        return w
      })
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [sidebarWidth])

  const rootFolders = folders.filter(f => f.parentId === null)

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
          Folders
        </span>
        <button
          className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text)]"
          onClick={() => {
            setNewFolderParentId(null)
            setCreatingFolder(true)
          }}
          aria-label="New folder"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* All Documents */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <button
          className={`mb-1 flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
            activeFolderId === 'all' && !activeTagId
              ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
          }`}
          onClick={() => {
            onSelectFolder('all')
            onSelectTag(null)
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          All Documents
        </button>

        {/* Unfiled */}
        <button
          className={`mb-1 flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
            dragOverUnfiled
              ? 'bg-[var(--color-accent)]/20 ring-2 ring-[var(--color-accent)] ring-inset'
              : activeFolderId === null && !activeTagId
                ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
          }`}
          onClick={() => {
            onSelectFolder(null)
            onSelectTag(null)
          }}
          onDragOver={e => {
            if (e.dataTransfer.types.includes('application/markpad-doc-id')) {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              setDragOverUnfiled(true)
            }
          }}
          onDragLeave={() => setDragOverUnfiled(false)}
          onDrop={e => {
            e.preventDefault()
            setDragOverUnfiled(false)
            const docId = e.dataTransfer.getData('application/markpad-doc-id')
            if (docId && onMoveDocument) {
              onMoveDocument(docId, null)
            }
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
          Unfiled
        </button>

        {/* Folder tree */}
        {rootFolders.map(f => (
          <FolderNode
            key={f.id}
            folder={f}
            children={folders.filter(c => c.parentId === f.id)}
            allFolders={folders}
            activeFolderId={activeFolderId}
            onSelect={id => {
              onSelectFolder(id)
              onSelectTag(null)
            }}
            onRename={onRenameFolder}
            onDelete={onDeleteFolder}
            onCreateChild={startCreateChild}
            onMoveDocument={onMoveDocument}
            depth={0}
          />
        ))}

        {/* New folder input */}
        {creatingFolder && (
          <div className="mt-1 px-2">
            <input
              ref={newFolderRef}
              className="w-full rounded border border-[var(--color-accent)] bg-[var(--color-bg)] px-2 py-1 text-sm text-[var(--color-text)] outline-none"
              placeholder="Folder name"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onBlur={submitNewFolder}
              onKeyDown={e => {
                if (e.key === 'Enter') submitNewFolder()
                if (e.key === 'Escape') {
                  setCreatingFolder(false)
                  setNewFolderName('')
                }
              }}
            />
          </div>
        )}

        {/* Tags section */}
        {tags.length > 0 && (
          <>
            <div className="mt-4 mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Tags
            </div>
            {tags.map(tag => (
              <button
                key={tag.id}
                className={`mb-0.5 flex w-full items-center gap-2 rounded px-2 py-1 text-sm transition-colors ${
                  activeTagId === tag.id
                    ? 'bg-[var(--color-accent)]/10 font-medium'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                }`}
                onClick={() => {
                  onSelectTag(activeTagId === tag.id ? null : tag.id)
                  onSelectFolder('all')
                }}
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="truncate" style={activeTagId === tag.id ? { color: tag.color } : undefined}>
                  {tag.name}
                </span>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden flex-shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg)] md:flex relative"
        style={{ width: sidebarWidth }}
      >
        <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
          {sidebar}
        </div>
        {/* Resize handle */}
        <div
          className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-[var(--color-accent)]/30 active:bg-[var(--color-accent)]/50 transition-colors z-10"
          onMouseDown={handleMouseDown}
        />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[var(--color-bg)] shadow-xl">
            {sidebar}
          </aside>
        </div>
      )}
    </>
  )
}
