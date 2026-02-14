import { saveAs } from 'file-saver'
import { getAllData, importData } from '@/lib/storage'
import type { WorkspaceBackup } from '@/types'

export async function exportWorkspaceBackup(): Promise<void> {
  const data = await getAllData()
  const backup: WorkspaceBackup = {
    version: 1,
    exportedAt: Date.now(),
    documents: data.documents,
    folders: data.folders,
    tags: data.tags,
    settings: data.settings,
  }
  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const date = new Date().toISOString().slice(0, 10)
  saveAs(blob, `markpad-backup-${date}.json`)
}

export async function importWorkspaceBackup(
  file: File,
  merge: boolean
): Promise<{ documents: number; folders: number; tags: number }> {
  const text = await file.text()
  let backup: WorkspaceBackup

  try {
    backup = JSON.parse(text)
  } catch {
    throw new Error('Invalid JSON file')
  }

  if (!backup.version || !Array.isArray(backup.documents)) {
    throw new Error('Invalid Markpad backup file')
  }

  await importData(
    {
      documents: backup.documents ?? [],
      folders: backup.folders ?? [],
      tags: backup.tags ?? [],
      settings: backup.settings,
    },
    merge
  )

  return {
    documents: backup.documents?.length ?? 0,
    folders: backup.folders?.length ?? 0,
    tags: backup.tags?.length ?? 0,
  }
}
