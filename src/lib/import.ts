import { createDocument } from '@/lib/storage'
import type { MarkpadDocument } from '@/types'

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

function filenameWithoutExtension(name: string): string {
  return name.replace(/\.[^/.]+$/, '')
}

function extractTitleFromMarkdown(content: string, filename: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : filenameWithoutExtension(filename)
}

export async function importMarkdownFile(file: File): Promise<MarkpadDocument> {
  const content = await readFileAsText(file)
  const title = extractTitleFromMarkdown(content, file.name)
  return createDocument({ title, content })
}

export async function importTextFile(file: File): Promise<MarkpadDocument> {
  const content = await readFileAsText(file)
  const title = filenameWithoutExtension(file.name)
  return createDocument({ title, content })
}

export async function importFile(file: File): Promise<MarkpadDocument> {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'md' || ext === 'markdown') {
    return importMarkdownFile(file)
  }
  return importTextFile(file)
}
