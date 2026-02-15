import { useState, useRef, useEffect } from 'react'
import { compressAndEncrypt, estimateShareSize, type ShareError } from '@/lib/sharing'

interface ShareModalProps {
  markdown: string
  onClose: () => void
}

export function ShareModal({ markdown, onClose }: ShareModalProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const sizeInfo = estimateShareSize(markdown)

  useEffect(() => {
    passwordRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  async function handleGenerate() {
    setError(null)

    if (password.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!sizeInfo.fits) {
      setError(`This note is too large for link sharing (~${sizeInfo.wordCount.toLocaleString()} words). Try shortening it or export as markdown instead.`)
      return
    }

    setLoading(true)
    try {
      const payload = await compressAndEncrypt(markdown, password)
      const url = `${window.location.origin}/s#${payload}`
      setShareUrl(url)
    } catch (err) {
      if (err === ('too-large' as ShareError)) {
        setError(`This note is too large for link sharing (~${sizeInfo.wordCount.toLocaleString()} words). Try shortening it or export as markdown instead.`)
      } else {
        setError('Failed to generate share link. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select the text
      const input = document.querySelector<HTMLInputElement>('[data-share-url]')
      if (input) {
        input.select()
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-accent)]">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <h2 className="text-base font-semibold text-[var(--color-text)]">Share Note</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors text-lg leading-none p-1"
          >
            &times;
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {!shareUrl ? (
            <>
              {/* Info */}
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Create an encrypted link to share this note. The content is encrypted in your browser — no data is sent to any server. Share the password separately.
              </p>

              {/* Size indicator */}
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                <span>{sizeInfo.wordCount.toLocaleString()} words</span>
                <span className="opacity-40">·</span>
                {sizeInfo.fits ? (
                  <span className="text-green-600 dark:text-green-400">Ready to share</span>
                ) : (
                  <span className="text-red-500">Too large for link sharing</span>
                )}
              </div>

              {/* Password inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    Password
                  </label>
                  <input
                    ref={passwordRef}
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter a password (min 4 characters)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)]
                      bg-[var(--color-bg-secondary)] text-[var(--color-text)]
                      placeholder:text-[var(--color-text-secondary)] outline-none
                      focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleGenerate()
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)]
                      bg-[var(--color-bg-secondary)] text-[var(--color-text)]
                      placeholder:text-[var(--color-text-secondary)] outline-none
                      focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleGenerate()
                    }}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !sizeInfo.fits || password.length < 4}
                className="w-full px-4 py-2 text-sm font-medium rounded-lg
                  bg-[var(--color-accent)] text-white
                  hover:opacity-90 transition-opacity
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Encrypting...' : 'Generate Share Link'}
              </button>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Link generated! Share it along with the password.
              </div>

              {/* URL display */}
              <div className="relative">
                <input
                  data-share-url
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full px-3 py-2 pr-20 text-xs font-mono rounded-lg border border-[var(--color-border)]
                    bg-[var(--color-bg-secondary)] text-[var(--color-text)] outline-none select-all"
                  onClick={e => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={handleCopy}
                  className="absolute right-1 top-1 px-3 py-1 text-xs font-medium rounded-md
                    bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Security reminder */}
              <div className="rounded-lg bg-[var(--color-bg-secondary)] px-3 py-2.5 space-y-1.5">
                <p className="text-xs font-medium text-[var(--color-text)]">Security notes:</p>
                <ul className="text-xs text-[var(--color-text-secondary)] space-y-1 list-disc list-inside">
                  <li>Share the password through a different channel than the link</li>
                  <li>The note content is encrypted — no one can read it without the password</li>
                  <li>No data is stored on any server</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShareUrl(null)
                    setPassword('')
                    setConfirmPassword('')
                    setCopied(false)
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)]
                    text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                >
                  New Link
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg
                    bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
