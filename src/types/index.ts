export interface MarkpadDocument {
  id: string
  title: string
  content: string // Markdown string
  blockNoteContent: unknown // BlockNote JSON for lossless editing
  folderId: string | null
  tags: string[]
  createdAt: number
  updatedAt: number
}

export interface Folder {
  id: string
  name: string
  parentId: string | null
  order: number
  createdAt: number
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  onboardingDismissed: boolean
  lastOpenedDocId: string | null
}

export interface WorkspaceBackup {
  version: 1
  exportedAt: number
  documents: MarkpadDocument[]
  folders: Folder[]
  tags: Tag[]
  settings: AppSettings
}

export type SortField = 'title' | 'createdAt' | 'updatedAt'
export type SortDirection = 'asc' | 'desc'

export interface ExportOptions {
  format: 'md' | 'txt' | 'docx' | 'gdocs'
  template?: string // template name for docx
}
