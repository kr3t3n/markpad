import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDocuments } from '@/hooks/useDocuments'
import type { SortField, SortDirection } from '@/types'
import { DocumentCard } from './DocumentCard'
import { FolderSidebar } from './FolderSidebar'
import { ImportHandler } from './ImportHandler'

export function FileManager() {
  const navigate = useNavigate()
  const {
    documents,
    folders,
    tags,
    loading,
    createDocument,
    updateDocument,
    deleteDocument,
    duplicateDocument,
    createFolder,
    updateFolder,
    deleteFolder,
    sortDocuments,
    searchDocuments,
  } = useDocuments()

  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const [activeFolderId, setActiveFolderId] = useState<string | null | 'all'>('all')
  const [activeTagId, setActiveTagId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filteredDocs = useMemo(() => {
    let docs = search ? searchDocuments(search) : documents

    // Folder filter
    if (activeFolderId === null) {
      docs = docs.filter(d => d.folderId === null)
    } else if (activeFolderId !== 'all') {
      docs = docs.filter(d => d.folderId === activeFolderId)
    }

    // Tag filter
    if (activeTagId) {
      const tag = tags.find(t => t.id === activeTagId)
      if (tag) {
        docs = docs.filter(d => d.tags.includes(tag.name))
      }
    }

    return sortDocuments(docs, sortField, sortDir)
  }, [documents, search, searchDocuments, activeFolderId, activeTagId, tags, sortDocuments, sortField, sortDir])

  const handleNewDocument = useCallback(async () => {
    const doc = await createDocument()
    navigate(`/app/doc/${doc.id}`)
  }, [createDocument, navigate])

  const handleImport = useCallback(async (title: string, content: string) => {
    await createDocument({
      title,
      content,
      folderId: activeFolderId !== 'all' ? activeFolderId : null,
    })
  }, [createDocument, activeFolderId])

  const handleRename = useCallback(async (id: string, title: string) => {
    await updateDocument(id, { title })
  }, [updateDocument])

  const handleMove = useCallback(async (id: string, folderId: string | null) => {
    await updateDocument(id, { folderId })
  }, [updateDocument])

  const handleRenameFolder = useCallback(async (id: string, name: string) => {
    await updateFolder(id, { name })
  }, [updateFolder])

  const sortLabel: Record<SortField, string> = {
    title: 'Name',
    createdAt: 'Date created',
    updatedAt: 'Date modified',
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <FolderSidebar
        folders={folders}
        tags={tags}
        activeFolderId={activeFolderId}
        activeTagId={activeTagId}
        onSelectFolder={setActiveFolderId}
        onSelectTag={setActiveTagId}
        onCreateFolder={(name, parentId) => createFolder(name, parentId)}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={deleteFolder}
        onMoveDocument={handleMove}
        onDeleteDocument={deleteDocument}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
          {/* Hamburger (mobile) */}
          <button
            className="rounded p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Search */}
          <div className="relative flex-1 min-w-[160px]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] py-2 pl-9 pr-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] outline-none focus:border-[var(--color-accent)]"
              placeholder="Search documents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1">
            <select
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-2 text-sm text-[var(--color-text)] outline-none"
              value={sortField}
              onChange={e => setSortField(e.target.value as SortField)}
            >
              {(Object.keys(sortLabel) as SortField[]).map(f => (
                <option key={f} value={f}>{sortLabel[f]}</option>
              ))}
            </select>
            <button
              className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              aria-label="Toggle sort direction"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {sortDir === 'asc' ? (
                  <>
                    <polyline points="18 15 12 9 6 15" />
                  </>
                ) : (
                  <>
                    <polyline points="6 9 12 15 18 9" />
                  </>
                )}
              </svg>
            </button>
          </div>

          {/* Import */}
          <ImportHandler onImport={handleImport} />

          {/* New Document */}
          <button
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-90"
            onClick={handleNewDocument}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New
          </button>
        </div>

        {/* Document grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p className="mb-1 text-sm font-medium text-[var(--color-text-secondary)]">
                {search ? 'No matching documents' : 'No documents yet'}
              </p>
              <p className="mb-4 text-xs text-[var(--color-text-tertiary)]">
                {search
                  ? 'Try a different search term'
                  : 'Create a new document or import a markdown file'}
              </p>
              {!search && (
                <button
                  className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-bg)] hover:opacity-90"
                  onClick={handleNewDocument}
                >
                  Create your first document
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredDocs.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  tags={tags}
                  folders={folders.map(f => ({ id: f.id, name: f.name }))}
                  onRename={handleRename}
                  onDuplicate={duplicateDocument}
                  onMove={handleMove}
                  onDelete={deleteDocument}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
