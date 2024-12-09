import { marked } from 'marked';

export const parseMarkdown = async (text: string): Promise<string> => {
  return marked(text, { breaks: true, async: true });
};

export type TextTransform = 'sentence' | 'lower' | 'upper' | 'camel' | 'camelTrim';

export const transformText = (text: string, type: TextTransform): string => {
  switch (type) {
    case 'sentence':
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case 'lower':
      return text.toLowerCase();
    case 'upper':
      return text.toUpperCase();
    case 'camel':
      return text.split(/\s+/).map((word, index) => 
        index === 0 ? word.charAt(0).toLowerCase() + word.slice(1) : 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    case 'camelTrim':
      return text.split(/\s+/).map((word, index) => 
        index === 0 ? word.charAt(0).toLowerCase() + word.slice(1) : 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join('');
    default:
      return text;
  }
};

export const shortcuts = {
  bold: { key: 'b', before: '**', after: '**' },
  italic: { key: 'i', before: '_', after: '_' },
  underline: { key: 'u', before: '<u>', after: '</u>' },
  code: { key: '`', before: '```\n', after: '\n```' },
  link: { key: 'k', before: '[', after: '](url)' },
  h1: { key: '1', before: '# ', after: '' },
  h2: { key: '2', before: '## ', after: '' },
  h3: { key: '3', before: '### ', after: '' },
  strikethrough: { key: 's', before: '~~', after: '~~' },
  superscript: { key: '6', before: '<sup>', after: '</sup>' },
  subscript: { key: '5', before: '<sub>', after: '</sub>' },
  bulletList: { key: '8', before: '- ', after: '' },
  numberList: { key: '9', before: '1. ', after: '' },
} as const;