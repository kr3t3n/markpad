import { useCallback } from 'react'

interface SourceEditorProps {
  markdown: string
  onChange: (markdown: string) => void
}

export function SourceEditor({ markdown, onChange }: SourceEditorProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value)
    },
    [onChange],
  )

  return (
    <div className="flex-1 min-h-0 overflow-hidden">
      <textarea
        value={markdown}
        onChange={handleChange}
        spellCheck={false}
        className="w-full h-full resize-none p-6 font-mono text-sm leading-relaxed
          bg-[var(--color-bg)] text-[var(--color-text)]
          border-none outline-none
          placeholder:text-[var(--color-text-tertiary)]"
        placeholder="Write markdown here..."
      />
    </div>
  )
}
