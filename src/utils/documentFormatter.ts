import { TextRun, Paragraph, HeadingLevel, AlignmentType } from 'docx';

interface FormattedBlock {
  type: 'paragraph' | 'heading' | 'code' | 'list';
  content: string;
  level?: number;
  ordered?: boolean;
}

export function parseMarkdownToBlocks(markdown: string): FormattedBlock[] {
  const lines = markdown.split('\n');
  const blocks: FormattedBlock[] = [];
  let codeBlock = false;
  let currentCode = '';

  lines.forEach(line => {
    // Handle code blocks
    if (line.startsWith('```')) {
      if (codeBlock) {
        blocks.push({ type: 'code', content: currentCode.trim() });
        currentCode = '';
      }
      codeBlock = !codeBlock;
      return;
    }

    if (codeBlock) {
      currentCode += line + '\n';
      return;
    }

    // Handle headings
    const headingMatch = line.match(/^(#{1,6})\s(.+)/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        content: headingMatch[2],
        level: headingMatch[1].length
      });
      return;
    }

    // Handle lists
    const unorderedListMatch = line.match(/^[-*+]\s(.+)/);
    if (unorderedListMatch) {
      blocks.push({
        type: 'list',
        content: unorderedListMatch[1],
        ordered: false
      });
      return;
    }

    const orderedListMatch = line.match(/^\d+\.\s(.+)/);
    if (orderedListMatch) {
      blocks.push({
        type: 'list',
        content: orderedListMatch[1],
        ordered: true
      });
      return;
    }

    // Handle paragraphs
    if (line.trim()) {
      blocks.push({ type: 'paragraph', content: line });
    }
  });

  return blocks;
}

export function formatTextContent(text: string): TextRun[] {
  const runs: TextRun[] = [];
  let currentText = text;

  // Bold
  currentText = currentText.replace(/\*\*(.*?)\*\*/g, (_, content) => {
    runs.push(new TextRun({ text: content, bold: true }));
    return '';
  });

  // Italic
  currentText = currentText.replace(/_(.*?)_/g, (_, content) => {
    runs.push(new TextRun({ text: content, italics: true }));
    return '';
  });

  // Strikethrough
  currentText = currentText.replace(/~~(.*?)~~/g, (_, content) => {
    runs.push(new TextRun({ text: content, strike: true }));
    return '';
  });

  // Links
  currentText = currentText.replace(/\[(.*?)\]\((.*?)\)/g, (_, text, url) => {
    runs.push(new TextRun({ text: text, underline: true }));
    return '';
  });

  // Add remaining text
  if (currentText.trim()) {
    runs.push(new TextRun(currentText));
  }

  return runs;
}

export function getHeadingLevel(level: number): HeadingLevel {
  switch (level) {
    case 1: return HeadingLevel.HEADING_1;
    case 2: return HeadingLevel.HEADING_2;
    case 3: return HeadingLevel.HEADING_3;
    case 4: return HeadingLevel.HEADING_4;
    case 5: return HeadingLevel.HEADING_5;
    default: return HeadingLevel.HEADING_6;
  }
}

export function createOdtContent(blocks: FormattedBlock[]): string {
  let content = '';

  blocks.forEach(block => {
    switch (block.type) {
      case 'heading':
        content += `<text:h text:style-name="Heading_${block.level}">${block.content}</text:h>`;
        break;
      case 'code':
        content += `<text:p text:style-name="Preformatted_Text">${block.content}</text:p>`;
        break;
      case 'list':
        const listTag = block.ordered ? 'text:ordered-list' : 'text:unordered-list';
        content += `<${listTag}><text:list-item><text:p>${block.content}</text:p></text:list-item></${listTag}>`;
        break;
      default:
        content += `<text:p>${block.content}</text:p>`;
    }
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
                xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0">
  <office:styles>
    <style:style style:name="Heading_1" style:family="paragraph">
      <style:text-properties fo:font-size="24pt" fo:font-weight="bold"/>
    </style:style>
    <style:style style:name="Preformatted_Text" style:family="paragraph">
      <style:text-properties style:font-name="Courier New"/>
    </style:style>
  </office:styles>
  <office:body>
    <office:text>
      ${content}
    </office:text>
  </office:body>
</office:document>`;
}