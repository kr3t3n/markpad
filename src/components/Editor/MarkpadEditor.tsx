import { useState, useCallback, useRef, useEffect } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import { updateDocument } from '@/lib/storage'
import type { MarkpadDocument } from '@/types'
import { EditorToolbar } from './EditorToolbar'
import { SourceEditor } from './SourceEditor'

interface MarkpadEditorProps {
  document: MarkpadDocument
  resolvedTheme: 'light' | 'dark'
}

export function MarkpadEditor({ document: initialDoc, resolvedTheme }: MarkpadEditorProps) {
  const [title, setTitle] = useState(initialDoc.title)
  const [mode, setMode] = useState<'visual' | 'source'>('visual')
  const [markdown, setMarkdown] = useState(initialDoc.content)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const docIdRef = useRef(initialDoc.id)

  const editor = useCreateBlockNote({
    initialContent: initialDoc.blockNoteContent
      ? (initialDoc.blockNoteContent as any[])
      : undefined,
  })

  // When a doc has markdown content but no blockNoteContent (e.g. imported files),
  // parse the markdown into blocks on first load.
  const hasInitializedRef = useRef(false)
  useEffect(() => {
    if (hasInitializedRef.current) return
    hasInitializedRef.current = true
    if (!initialDoc.blockNoteContent && initialDoc.content) {
      const blocks = editor.tryParseMarkdownToBlocks(initialDoc.content)
      editor.replaceBlocks(editor.document, blocks)
      // Persist the parsed blocks so next open doesn't need to re-parse
      updateDocument(docIdRef.current, { blockNoteContent: editor.document })
    }
  }, [editor, initialDoc.blockNoteContent, initialDoc.content])

  const scheduleSave = useCallback(
    (updates: Partial<MarkpadDocument>) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
      saveTimerRef.current = setTimeout(() => {
        updateDocument(docIdRef.current, updates)
      }, 500)
    },
    [],
  )

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value
      setTitle(newTitle)
      scheduleSave({ title: newTitle })
    },
    [scheduleSave],
  )

  const handleEditorChange = useCallback(async () => {
    const blocks = editor.document
    // Use the editor's built-in markdown export
    const md = await editor.blocksToMarkdownLossy(blocks)
    setMarkdown(md)
    scheduleSave({
      blockNoteContent: blocks,
      content: md,
    })
  }, [editor, scheduleSave])

  const handleMarkdownChange = useCallback(
    (newMarkdown: string) => {
      setMarkdown(newMarkdown)
      scheduleSave({ content: newMarkdown })
    },
    [scheduleSave],
  )

  const handleModeChange = useCallback(
    async (newMode: 'visual' | 'source') => {
      if (newMode === 'source' && mode === 'visual') {
        const md = await editor.blocksToMarkdownLossy(editor.document)
        setMarkdown(md)
      } else if (newMode === 'visual' && mode === 'source') {
        const blocks = await editor.tryParseMarkdownToBlocks(markdown)
        editor.replaceBlocks(editor.document, blocks)
        scheduleSave({
          blockNoteContent: editor.document,
          content: markdown,
        })
      }
      setMode(newMode)
    },
    [mode, editor, markdown, scheduleSave],
  )

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar
        title={title}
        mode={mode}
        onModeChange={handleModeChange}
        document={{ ...initialDoc, title, content: markdown }}
      />

      <div className="px-6 pt-6 pb-2">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="w-full text-3xl font-bold bg-transparent border-none outline-none
            text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]"
        />
      </div>

      {mode === 'visual' ? (
        <div
          className="flex-1 min-h-0 overflow-auto px-2 cursor-text"
          onClick={e => {
            // If user clicks the empty area below editor content, focus at end
            const target = e.target as HTMLElement
            // Only handle clicks on the wrapper itself, not on editor content
            if (target === e.currentTarget || target.closest('.bn-container') === null) {
              const blocks = editor.document
              if (blocks.length > 0) {
                const lastBlock = blocks[blocks.length - 1]
                editor.setTextCursorPosition(lastBlock, 'end')
                editor.focus()
              }
            }
          }}
        >
          <BlockNoteView
            editor={editor}
            onChange={handleEditorChange}
            theme={resolvedTheme}
          />
          {/* Spacer to create clickable area below content */}
          <div className="min-h-[50vh]" />
        </div>
      ) : (
        <SourceEditor markdown={markdown} onChange={handleMarkdownChange} />
      )}
    </div>
  )
}
