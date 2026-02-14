import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { parseMarkdownToBlocks, formatTextContent, getHeadingLevel, createOdtContent } from './documentFormatter';

export const exportToMarkdown = (content: string) => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, 'document.md');
};

export const exportToPlainText = (content: string) => {
  // Remove markdown syntax for plain text
  const plainText = content
    .replace(/#{1,6} /g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/_(.*?)_/g, '$1') // Remove italic
    .replace(/~~(.*?)~~/g, '$1') // Remove strikethrough
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, '').trim()) // Clean code blocks
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Clean links
    .replace(/<\/?[^>]+(>|$)/g, ''); // Remove HTML tags

  const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, 'document.txt');
};

export const exportToDocx = async (content: string) => {
  const blocks = parseMarkdownToBlocks(content);
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: blocks.map(block => {
        switch (block.type) {
          case 'heading':
            return new Paragraph({
              text: block.content,
              heading: getHeadingLevel(block.level || 1)
            });
          case 'code':
            return new Paragraph({
              children: [
                new TextRun({
                  text: block.content,
                  font: 'Courier New',
                  size: 20
                })
              ],
              spacing: {
                before: 240,
                after: 240
              },
              shading: {
                type: 'solid',
                color: 'F5F5F5'
              }
            });
          case 'list':
            return new Paragraph({
              children: formatTextContent(block.content),
              bullet: {
                level: 0
              }
            });
          default:
            return new Paragraph({
              children: formatTextContent(block.content)
            });
        }
      })
    }]
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, 'document.docx');
};

export const exportToOdt = (content: string) => {
  const blocks = parseMarkdownToBlocks(content);
  const odtContent = createOdtContent(blocks);
  
  const blob = new Blob([odtContent], { type: 'application/vnd.oasis.opendocument.text' });
  saveAs(blob, 'document.odt');
};