import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import {
  decryptAndDecompress,
  decompressOnly,
  isEncryptedPayload,
  parseSharePayload,
  type ShareError,
} from '@/lib/sharing'
import { createDocument } from '@/lib/storage'

type ViewerState =
  | { phase: 'password' }
  | { phase: 'decrypting' }
  | { phase: 'content'; title: string; markdown: string }
  | { phase: 'error'; kind: 'no-data' | 'wrong-password' | 'corrupted' }

export function ShareViewer() {
  const [state, setState] = useState<ViewerState>({ phase: 'password' })
  const [password, setPassword] = useState('')
  const [payload, setPayload] = useState('')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  // Resolve theme from system preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => {
      const dark = mq.matches
      setResolvedTheme(dark ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', dark)
    }
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Extract payload from URL hash
  useEffect(() => {
    const hash = window.location.hash.slice(1) // remove #
    if (!hash) {
      setState({ phase: 'error', kind: 'no-data' })
      return
    }
    setPayload(hash)

    // Auto-decompress if unencrypted (no dots = not encrypted)
    if (!isEncryptedPayload(hash)) {
      try {
        const raw = decompressOnly(hash)
        const { title, markdown } = parseSharePayload(raw)
        setState({ phase: 'content', title, markdown })
      } catch {
        setState({ phase: 'error', kind: 'corrupted' })
      }
    }
  }, [])

  const handleDecrypt = useCallback(async () => {
    if (!password || !payload) return
    setState({ phase: 'decrypting' })
    try {
      const raw = await decryptAndDecompress(payload, password)
      const { title, markdown } = parseSharePayload(raw)
      setState({ phase: 'content', title, markdown })
    } catch (err) {
      const kind = err as ShareError
      if (kind === 'wrong-password') {
        setState({ phase: 'error', kind: 'wrong-password' })
      } else {
        setState({ phase: 'error', kind: 'corrupted' })
      }
    }
  }, [password, payload])

  if (state.phase === 'content') {
    return (
      <ContentView
        title={state.title}
        markdown={state.markdown}
        resolvedTheme={resolvedTheme}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <img
              src={resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-white.png'}
              alt=""
              className="h-6 w-6"
            />
            <span className="text-lg font-semibold tracking-tight text-[var(--color-text)]">Markpad</span>
          </div>

          {state.phase === 'error' && state.kind === 'no-data' ? (
            <div className="text-center space-y-3">
              <div className="text-4xl mb-2">🔗</div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                This link doesn't contain any shared content.
              </p>
              <a
                href="/app"
                className="inline-block mt-4 px-4 py-2 text-sm font-medium rounded-lg
                  bg-[var(--color-accent)] text-[var(--color-bg)] hover:opacity-90 transition-opacity"
              >
                Open Markpad
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Lock icon */}
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-accent)]">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
              </div>

              <div className="text-center space-y-1">
                <h1 className="text-base font-semibold text-[var(--color-text)]">Encrypted Note</h1>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Enter the password to decrypt and read this note
                </p>
              </div>

              {/* Error messages */}
              {state.phase === 'error' && state.kind === 'wrong-password' && (
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2 text-center">
                  Wrong password. Please try again.
                </p>
              )}
              {state.phase === 'error' && state.kind === 'corrupted' && (
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2 text-center">
                  This link appears to be corrupted or incomplete.
                </p>
              )}

              {/* Password input */}
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--color-border)]
                  bg-[var(--color-bg-secondary)] text-[var(--color-text)]
                  placeholder:text-[var(--color-text-secondary)] outline-none
                  focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleDecrypt()
                }}
              />

              {/* Decrypt button */}
              <button
                onClick={handleDecrypt}
                disabled={state.phase === 'decrypting' || !password}
                className="w-full px-4 py-2.5 text-sm font-medium rounded-lg
                  bg-[var(--color-accent)] text-[var(--color-bg)]
                  hover:opacity-90 transition-opacity
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.phase === 'decrypting' ? 'Decrypting...' : 'Decrypt'}
              </button>

              {/* Privacy note */}
              <p className="text-[10px] text-[var(--color-text-secondary)] text-center opacity-60">
                Decryption happens entirely in your browser. No data is sent to any server.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center">
        <a
          href="/"
          className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
        >
          Made with Markpad — free, private markdown editor
        </a>
      </footer>
    </div>
  )
}

// ---- Content View (decrypted note) ----

function ContentView({
  title,
  markdown,
  resolvedTheme,
}: {
  title: string
  markdown: string
  resolvedTheme: 'light' | 'dark'
}) {
  const navigate = useNavigate()
  const editor = useCreateBlockNote({})
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (loaded) return
    async function parse() {
      const blocks = await editor.tryParseMarkdownToBlocks(markdown)
      editor.replaceBlocks(editor.document, blocks)
      setLoaded(true)
    }
    parse()
  }, [editor, markdown, loaded])

  async function handleAddToEditor() {
    if (saving) return
    setSaving(true)
    try {
      const doc = await createDocument({ title, content: markdown })
      navigate(`/app/doc/${doc.id}`)
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Header */}
      <nav className="flex-shrink-0 flex h-12 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4">
        <a
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors shrink-0"
        >
          <img
            src={resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-white.png'}
            alt=""
            className="h-5 w-5"
          />
          <span className="hidden sm:inline">Markpad</span>
        </a>

        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-[var(--color-text)] truncate">
              {title}
            </span>
            <span className="text-[10px] text-[var(--color-text-secondary)] shrink-0 hidden sm:inline">
              (read-only)
            </span>
          </div>

          <button
            onClick={handleAddToEditor}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md shrink-0
              bg-[var(--color-accent)] text-[var(--color-bg)]
              hover:opacity-90 transition-opacity
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="hidden sm:inline">{saving ? 'Saving...' : 'Add to Editor'}</span>
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">{title}</h1>
        <BlockNoteView
          editor={editor}
          editable={false}
          theme={resolvedTheme}
        />
      </main>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-[var(--color-border)]">
        <a
          href="/"
          className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
        >
          Made with Markpad — free, private markdown editor
        </a>
      </footer>
    </div>
  )
}
