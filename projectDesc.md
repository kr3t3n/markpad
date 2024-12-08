# Markpad - Free Markdown Editor

## Overview

Markpad is a modern, feature-rich markdown editor built with React and TypeScript. It provides a seamless writing experience with real-time preview, rich formatting options, and multiple export capabilities.

## Features

### Rich Text Editing
- Real-time markdown preview
- Keyboard shortcuts for common formatting
- Support for headers, lists, code blocks, and more
- Syntax highlighting for code blocks
- Inline HTML support

### Text Formatting Options
- Bold, italic, and underline
- Strikethrough text
- Superscript and subscript
- Multiple heading levels (H1-H3)
- Ordered and unordered lists
- Code blocks with syntax highlighting
- Hyperlinks

### Text Case Transformations
- Sentence case
- UPPERCASE
- lowercase
- camelCase (with spaces)
- camelCase (without spaces)

### Export Options
- Markdown (.md)
- Plain Text (.txt)
- Word Document (.docx)
- OpenDocument Text (.odt)

### User Experience
- Dark/Light mode toggle
- Persistent storage of content
- Responsive layout (vertical/horizontal split)
- Collapsible panels
- Clean, modern interface
- Mobile-friendly design

## Technical Stack

### Core Technologies
- React 18
- TypeScript
- Vite
- Tailwind CSS

### Key Dependencies
- marked: Markdown parsing and rendering
- docx: Word document generation
- file-saver: File download handling
- lucide-react: Icon components
- js-cookie: Persistent storage

### Development Tools
- ESLint
- PostCSS
- Autoprefixer
- TypeScript ESLint

## Project Structure

```
src/
├── components/         # React components
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
│   ├── markdown.ts    # Markdown processing
│   ├── export.ts      # Export functionality
│   └── documentFormatter.ts  # Document formatting
└── main.tsx          # Application entry point
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Build for production: `npm run build`

## License

Free to use and open to everyone.

## Credits

Created by [Georgi](https://x.com/georgipep) from Mangia Studios Limited.

Support the project: [Buy me a coffee](https://www.buymeacoffee.com/georgipep) ☕