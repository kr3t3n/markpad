import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDocument } from '@/lib/storage'
import type { MarkpadDocument } from '@/types'
import { MarkpadEditor } from './MarkpadEditor'

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [doc, setDoc] = useState<MarkpadDocument | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      navigate('/app', { replace: true })
      return
    }

    getDocument(id).then((found) => {
      if (found) {
        setDoc(found)
      } else {
        navigate('/app', { replace: true })
      }
      setLoading(false)
    })
  }, [id, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)]">
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (!doc) {
    return null
  }

  return <MarkpadEditor key={doc.id} document={doc} />
}
