import { saveAs } from 'file-saver'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ExternalHyperlink,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  LevelFormat,
} from 'docx'
import { marked } from 'marked'
import type { MarkpadDocument } from '@/types'

// ─── Markdown export ───

export function exportAsMarkdown(doc: MarkpadDocument): void {
  const blob = new Blob([doc.content], { type: 'text/markdown;charset=utf-8' })
  saveAs(blob, `${sanitizeFilename(doc.title)}.md`)
}

// ─── Plain text export ───

export function exportAsText(doc: MarkpadDocument): void {
  const plain = stripMarkdown(doc.content)
  const blob = new Blob([plain], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, `${sanitizeFilename(doc.title)}.txt`)
}

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, '')        // headings
    .replace(/\*\*(.+?)\*\*/g, '$1')    // bold
    .replace(/\*(.+?)\*/g, '$1')        // italic
    .replace(/~~(.+?)~~/g, '$1')        // strikethrough
    .replace(/`{1,3}[^`]*`{1,3}/g, m => m.replace(/`/g, '')) // code
    .replace(/^\s*[-*+]\s+/gm, '  - ')  // unordered lists
    .replace(/^\s*\d+\.\s+/gm, '  ')    // ordered lists
    .replace(/^\s*>\s+/gm, '')           // blockquotes
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // images
    .replace(/^---+$/gm, '')            // horizontal rules
    .replace(/\n{3,}/g, '\n\n')         // collapse blank lines
    .trim()
}

// ─── DOCX export ───

interface TemplateStyle {
  headingFont: string
  bodyFont: string
  headingColor: string
  bodyColor: string
}

const TEMPLATES: Record<string, TemplateStyle> = {
  default: {
    headingFont: 'Calibri',
    bodyFont: 'Calibri',
    headingColor: '1a1a1a',
    bodyColor: '333333',
  },
  professional: {
    headingFont: 'Garamond',
    bodyFont: 'Garamond',
    headingColor: '1b3a5c',
    bodyColor: '2c2c2c',
  },
}

export async function exportAsDocx(
  doc: MarkpadDocument,
  templateName: string = 'default'
): Promise<void> {
  const style = TEMPLATES[templateName] ?? TEMPLATES.default
  const children = parseMarkdownToDocx(doc.content, style)

  const document = new Document({
    numbering: {
      config: [
        {
          reference: 'ordered-list',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
    sections: [{ children }],
  })

  const blob = await Packer.toBlob(document)
  saveAs(blob, `${sanitizeFilename(doc.title)}.docx`)
}

function parseMarkdownToDocx(
  md: string,
  style: TemplateStyle
): (Paragraph | Table)[] {
  const lines = md.split('\n')
  const elements: (Paragraph | Table)[] = []
  let i = 0
  let inCodeBlock = false
  let codeLines: string[] = []

  while (i < lines.length) {
    const line = lines[i]

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: codeLines.join('\n'),
                font: 'Courier New',
                size: 20,
              }),
            ],
            shading: { type: ShadingType.SOLID, color: 'f3f4f6', fill: 'f3f4f6' },
            spacing: { before: 100, after: 100 },
          })
        )
        codeLines = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      i++
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      i++
      continue
    }

    // Empty line
    if (line.trim() === '') {
      i++
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      elements.push(
        new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' },
          },
          spacing: { before: 200, after: 200 },
        })
      )
      i++
      continue
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const headingLevels: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5,
        6: HeadingLevel.HEADING_6,
      }
      elements.push(
        new Paragraph({
          heading: headingLevels[level],
          children: parseInlineFormatting(headingMatch[2], {
            font: style.headingFont,
            color: style.headingColor,
            bold: true,
          }),
        })
      )
      i++
      continue
    }

    // Table detection
    if (line.includes('|') && i + 1 < lines.length && /^\|?[\s-:|]+\|?$/.test(lines[i + 1])) {
      const tableLines: string[] = [line]
      let j = i + 1
      while (j < lines.length && lines[j].includes('|')) {
        tableLines.push(lines[j])
        j++
      }
      const table = parseTable(tableLines, style)
      if (table) elements.push(table)
      i = j
      continue
    }

    // Blockquote
    if (line.trim().startsWith('>')) {
      const text = line.replace(/^>\s*/, '')
      elements.push(
        new Paragraph({
          indent: { left: 720 },
          border: {
            left: { style: BorderStyle.SINGLE, size: 3, color: style.headingColor },
          },
          children: parseInlineFormatting(text, {
            font: style.bodyFont,
            color: '666666',
            italics: true,
          }),
          spacing: { before: 100, after: 100 },
        })
      )
      i++
      continue
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const text = line.replace(/^\s*[-*+]\s+/, '')
      // Check for task list
      const taskMatch = text.match(/^\[([ xX])\]\s+(.+)/)
      const displayText = taskMatch ? `${taskMatch[1] === ' ' ? '☐' : '☑'} ${taskMatch[2]}` : text
      elements.push(
        new Paragraph({
          bullet: { level: 0 },
          children: parseInlineFormatting(displayText, {
            font: style.bodyFont,
            color: style.bodyColor,
          }),
        })
      )
      i++
      continue
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const text = line.replace(/^\s*\d+\.\s+/, '')
      elements.push(
        new Paragraph({
          numbering: { reference: 'ordered-list', level: 0 },
          children: parseInlineFormatting(text, {
            font: style.bodyFont,
            color: style.bodyColor,
          }),
        })
      )
      i++
      continue
    }

    // Regular paragraph
    elements.push(
      new Paragraph({
        children: parseInlineFormatting(line, {
          font: style.bodyFont,
          color: style.bodyColor,
        }),
        spacing: { after: 120 },
      })
    )
    i++
  }

  return elements
}

interface InlineStyle {
  font: string
  color: string
  bold?: boolean
  italics?: boolean
}

function parseInlineFormatting(text: string, base: InlineStyle): (TextRun | ExternalHyperlink)[] {
  const runs: (TextRun | ExternalHyperlink)[] = []
  // Regex to match: **bold**, *italic*, ~~strike~~, `code`, [text](url)
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|~~(.+?)~~|`(.+?)`|\[([^\]]+)\]\(([^)]+)\))/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      runs.push(
        new TextRun({
          text: text.slice(lastIndex, match.index),
          font: base.font,
          color: base.color,
          bold: base.bold,
          italics: base.italics,
          size: 24,
        })
      )
    }

    if (match[2]) {
      // Bold
      runs.push(
        new TextRun({ text: match[2], font: base.font, color: base.color, bold: true, size: 24 })
      )
    } else if (match[3]) {
      // Italic
      runs.push(
        new TextRun({ text: match[3], font: base.font, color: base.color, italics: true, size: 24 })
      )
    } else if (match[4]) {
      // Strikethrough
      runs.push(
        new TextRun({ text: match[4], font: base.font, color: base.color, strike: true, size: 24 })
      )
    } else if (match[5]) {
      // Inline code
      runs.push(
        new TextRun({
          text: match[5],
          font: 'Courier New',
          color: base.color,
          size: 22,
          shading: { type: ShadingType.SOLID, color: 'f0f0f0', fill: 'f0f0f0' },
        })
      )
    } else if (match[6] && match[7]) {
      // Link
      runs.push(
        new ExternalHyperlink({
          link: match[7],
          children: [
            new TextRun({
              text: match[6],
              font: base.font,
              color: '2563eb',
              underline: {},
              size: 24,
            }),
          ],
        })
      )
    }

    lastIndex = match.index + match[0].length
  }

  // Remaining text
  if (lastIndex < text.length) {
    runs.push(
      new TextRun({
        text: text.slice(lastIndex),
        font: base.font,
        color: base.color,
        bold: base.bold,
        italics: base.italics,
        size: 24,
      })
    )
  }

  if (runs.length === 0) {
    runs.push(
      new TextRun({ text: text || ' ', font: base.font, color: base.color, size: 24 })
    )
  }

  return runs
}

function parseTable(tableLines: string[], style: TemplateStyle): Table | null {
  const rows = tableLines
    .filter(line => !/^\|?[\s-:|]+\|?$/.test(line)) // skip separator rows
    .map(line =>
      line
        .split('|')
        .map(cell => cell.trim())
        .filter(cell => cell !== '')
    )

  if (rows.length === 0) return null

  const tableRows = rows.map(
    (cells, rowIdx) =>
      new TableRow({
        children: cells.map(
          cell =>
            new TableCell({
              children: [
                new Paragraph({
                  children: parseInlineFormatting(cell, {
                    font: style.bodyFont,
                    color: style.bodyColor,
                    bold: rowIdx === 0,
                  }),
                }),
              ],
              width: { size: Math.floor(9000 / cells.length), type: WidthType.DXA },
              shading:
                rowIdx === 0
                  ? { type: ShadingType.SOLID, color: 'f1f5f9', fill: 'f1f5f9' }
                  : undefined,
            })
        ),
      })
  )

  return new Table({
    rows: tableRows,
    width: { size: 9000, type: WidthType.DXA },
  })
}

// ─── Google Docs export ───

export async function exportToGoogleDocs(doc: MarkpadDocument): Promise<string> {
  // Copy content to clipboard before opening the new tab
  let copied = false
  try {
    await navigator.clipboard.writeText(doc.content)
    copied = true
  } catch {
    // Clipboard not available — try execCommand fallback
    try {
      const textarea = document.createElement('textarea')
      textarea.value = doc.content
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      copied = true
    } catch {
      // Clipboard completely unavailable
    }
  }

  // Open a new Google Doc in a new tab
  window.open('https://docs.new', '_blank')

  if (copied) {
    return 'Content copied. In Google Docs go to Edit → Paste from Markdown to paste with formatting.'
  }
  return 'A new Google Doc has been opened, but clipboard copy failed. You can manually copy your content from the editor.'
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ─── Helpers ───

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'untitled'
}
