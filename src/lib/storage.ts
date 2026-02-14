import { openDB, type IDBPDatabase } from 'idb'
import { v4 as uuidv4 } from 'uuid'
import type { MarkpadDocument, Folder, Tag, AppSettings } from '@/types'

const DB_NAME = 'markpad'
const DB_VERSION = 1

interface MarkpadDB {
  documents: {
    key: string
    value: MarkpadDocument
    indexes: {
      'by-folder': string | null
      'by-updated': number
    }
  }
  folders: {
    key: string
    value: Folder
    indexes: {
      'by-parent': string | null
    }
  }
  tags: {
    key: string
    value: Tag
  }
  settings: {
    key: string
    value: AppSettings
  }
}

let dbPromise: Promise<IDBPDatabase<MarkpadDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MarkpadDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const docStore = db.createObjectStore('documents', { keyPath: 'id' })
        docStore.createIndex('by-folder', 'folderId')
        docStore.createIndex('by-updated', 'updatedAt')

        const folderStore = db.createObjectStore('folders', { keyPath: 'id' })
        folderStore.createIndex('by-parent', 'parentId')

        db.createObjectStore('tags', { keyPath: 'id' })
        db.createObjectStore('settings', { keyPath: 'id' as never })
      },
    })
  }
  return dbPromise
}

// Documents
export async function getAllDocuments(): Promise<MarkpadDocument[]> {
  const db = await getDB()
  return db.getAll('documents')
}

export async function getDocument(id: string): Promise<MarkpadDocument | undefined> {
  const db = await getDB()
  return db.get('documents', id)
}

export async function createDocument(partial?: Partial<MarkpadDocument>): Promise<MarkpadDocument> {
  const db = await getDB()
  const now = Date.now()
  const doc: MarkpadDocument = {
    id: uuidv4(),
    title: 'Untitled',
    content: '',
    blockNoteContent: null,
    folderId: null,
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
  await db.put('documents', doc)
  return doc
}

export async function updateDocument(id: string, updates: Partial<MarkpadDocument>): Promise<MarkpadDocument> {
  const db = await getDB()
  const existing = await db.get('documents', id)
  if (!existing) throw new Error(`Document ${id} not found`)
  const updated = { ...existing, ...updates, updatedAt: Date.now() }
  await db.put('documents', updated)
  return updated
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('documents', id)
}

export async function getDocumentsByFolder(folderId: string | null): Promise<MarkpadDocument[]> {
  const db = await getDB()
  return db.getAllFromIndex('documents', 'by-folder', folderId)
}

// Folders
export async function getAllFolders(): Promise<Folder[]> {
  const db = await getDB()
  return db.getAll('folders')
}

export async function createFolder(name: string, parentId: string | null = null): Promise<Folder> {
  const db = await getDB()
  const folder: Folder = {
    id: uuidv4(),
    name,
    parentId,
    createdAt: Date.now(),
  }
  await db.put('folders', folder)
  return folder
}

export async function updateFolder(id: string, updates: Partial<Folder>): Promise<Folder> {
  const db = await getDB()
  const existing = await db.get('folders', id)
  if (!existing) throw new Error(`Folder ${id} not found`)
  const updated = { ...existing, ...updates }
  await db.put('folders', updated)
  return updated
}

export async function deleteFolder(id: string): Promise<void> {
  const db = await getDB()
  // Move docs in this folder to root
  const docs = await getDocumentsByFolder(id)
  for (const doc of docs) {
    await updateDocument(doc.id, { folderId: null })
  }
  // Delete child folders
  const children = await db.getAllFromIndex('folders', 'by-parent', id)
  for (const child of children) {
    await deleteFolder(child.id)
  }
  await db.delete('folders', id)
}

// Tags
export async function getAllTags(): Promise<Tag[]> {
  const db = await getDB()
  return db.getAll('tags')
}

export async function createTag(name: string, color: string = '#1a1a1a'): Promise<Tag> {
  const db = await getDB()
  const tag: Tag = { id: uuidv4(), name, color }
  await db.put('tags', tag)
  return tag
}

export async function deleteTag(id: string): Promise<void> {
  const db = await getDB()
  const tag = await db.get('tags', id)
  if (!tag) return
  // Remove tag from all documents
  const docs = await getAllDocuments()
  for (const doc of docs) {
    if (doc.tags.includes(tag.name)) {
      await updateDocument(doc.id, { tags: doc.tags.filter(t => t !== tag.name) })
    }
  }
  await db.delete('tags', id)
}

// Settings
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  onboardingDismissed: false,
  lastOpenedDocId: null,
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB()
  const settings = await db.get('settings', 'app' as never)
  return settings ?? DEFAULT_SETTINGS
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  const db = await getDB()
  const current = await getSettings()
  const updated = { ...current, ...updates }
  await db.put('settings', { ...updated, id: 'app' } as never)
  return updated
}

// Bulk operations for backup/restore
export async function getAllData() {
  const [documents, folders, tags, settings] = await Promise.all([
    getAllDocuments(),
    getAllFolders(),
    getAllTags(),
    getSettings(),
  ])
  return { documents, folders, tags, settings }
}

export async function clearAllData(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['documents', 'folders', 'tags', 'settings'], 'readwrite')
  await Promise.all([
    tx.objectStore('documents').clear(),
    tx.objectStore('folders').clear(),
    tx.objectStore('tags').clear(),
    tx.objectStore('settings').clear(),
    tx.done,
  ])
}

export async function importData(data: {
  documents: MarkpadDocument[]
  folders: Folder[]
  tags: Tag[]
  settings?: AppSettings
}, merge: boolean = false): Promise<void> {
  if (!merge) {
    await clearAllData()
  }
  const db = await getDB()
  const tx = db.transaction(['documents', 'folders', 'tags', 'settings'], 'readwrite')
  for (const doc of data.documents) {
    await tx.objectStore('documents').put(doc)
  }
  for (const folder of data.folders) {
    await tx.objectStore('folders').put(folder)
  }
  for (const tag of data.tags) {
    await tx.objectStore('tags').put(tag)
  }
  if (data.settings) {
    await tx.objectStore('settings').put({ ...data.settings, id: 'app' } as never)
  }
  await tx.done
}
