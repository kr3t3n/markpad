import { useState, useEffect, useCallback } from 'react'
import * as storage from '@/lib/storage'
import type { MarkpadDocument, Folder, Tag, SortField, SortDirection } from '@/types'

export function useDocuments() {
  const [documents, setDocuments] = useState<MarkpadDocument[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [docs, flds, tgs] = await Promise.all([
      storage.getAllDocuments(),
      storage.getAllFolders(),
      storage.getAllTags(),
    ])
    setDocuments(docs)
    setFolders(flds)
    setTags(tgs)
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const createDocument = useCallback(async (partial?: Partial<MarkpadDocument>) => {
    const doc = await storage.createDocument(partial)
    await refresh()
    return doc
  }, [refresh])

  const updateDocument = useCallback(async (id: string, updates: Partial<MarkpadDocument>) => {
    const doc = await storage.updateDocument(id, updates)
    await refresh()
    return doc
  }, [refresh])

  const deleteDocument = useCallback(async (id: string) => {
    await storage.deleteDocument(id)
    await refresh()
  }, [refresh])

  const duplicateDocument = useCallback(async (id: string) => {
    const original = await storage.getDocument(id)
    if (!original) return
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = original
    const copy = await storage.createDocument({ ...rest, title: `${rest.title} (copy)` })
    await refresh()
    return copy
  }, [refresh])

  const createFolder = useCallback(async (name: string, parentId?: string | null) => {
    const folder = await storage.createFolder(name, parentId ?? null)
    await refresh()
    return folder
  }, [refresh])

  const updateFolder = useCallback(async (id: string, updates: Partial<Folder>) => {
    const folder = await storage.updateFolder(id, updates)
    await refresh()
    return folder
  }, [refresh])

  const deleteFolder = useCallback(async (id: string) => {
    await storage.deleteFolder(id)
    await refresh()
  }, [refresh])

  const reorderFolders = useCallback(async (updates: { id: string; order: number; parentId?: string | null }[]) => {
    await storage.reorderFolders(updates)
    await refresh()
  }, [refresh])

  const createTag = useCallback(async (name: string, color?: string) => {
    const tag = await storage.createTag(name, color)
    await refresh()
    return tag
  }, [refresh])

  const deleteTag = useCallback(async (id: string) => {
    await storage.deleteTag(id)
    await refresh()
  }, [refresh])

  const sortDocuments = useCallback((docs: MarkpadDocument[], field: SortField, direction: SortDirection) => {
    return [...docs].sort((a, b) => {
      const av = a[field]
      const bv = b[field]
      if (typeof av === 'string' && typeof bv === 'string') {
        return direction === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      if (typeof av === 'number' && typeof bv === 'number') {
        return direction === 'asc' ? av - bv : bv - av
      }
      return 0
    })
  }, [])

  const searchDocuments = useCallback((query: string) => {
    const q = query.toLowerCase()
    return documents.filter(d =>
      d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)
    )
  }, [documents])

  return {
    documents, folders, tags, loading, refresh,
    createDocument, updateDocument, deleteDocument, duplicateDocument,
    createFolder, updateFolder, deleteFolder, reorderFolders,
    createTag, deleteTag,
    sortDocuments, searchDocuments,
  }
}
