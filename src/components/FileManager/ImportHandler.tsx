import { useState, useRef, useCallback } from 'react'

interface ImportHandlerProps {
  onImport: (title: string, content: string) => Promise<void>
}

function titleFromFilename(filename: string): string {
  return filename.replace(/\.(md|txt)$/i, '')
}

function titleFromMarkdown(content: string, filename: string): string {
  const match = content.match(/^#{1,6}\s+(.+)$/m)
  return match ? match[1].trim() : titleFromFilename(filename)
}

export function ImportHandler({ onImport }: ImportHandlerProps) {
  const [dragging, setDragging] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  async function processFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'md' && ext !== 'txt') {
      showToast(`Unsupported file type: .${ext}`)
      return
    }

    const content = await file.text()
    const title = ext === 'md' ? titleFromMarkdown(content, file.name) : titleFromFilename(file.name)
    await onImport(title, content)
    showToast(`Imported "${title}"`)
  }

  async function handleFiles(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      await processFile(file)
    }
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (dragCounter.current === 1) setDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) setDragging(false)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current = 0
    setDragging(false)
    if (e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files)
    }
  }

  return (
    <>
      {/* Drop zone overlay */}
      <div
        className="contents"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {dragging && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-accent)]/10 backdrop-blur-sm">
            <div className="rounded-xl border-2 border-dashed border-[var(--color-accent)] bg-[var(--color-bg)] p-12 text-center shadow-xl">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-lg font-medium text-[var(--color-accent)]">
                Drop .md or .txt files to import
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.txt"
        multiple
        className="hidden"
        onChange={e => {
          if (e.target.files) handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {/* Import button */}
      <button
        className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]"
        onClick={() => fileInputRef.current?.click()}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Import
      </button>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-bg)] shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </>
  )
}
