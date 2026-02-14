<p align="center">
  <img src="public/logo.svg" alt="Markpad" width="64" height="64" />
</p>

<h1 align="center">Markpad</h1>

<p align="center">
  <strong>A free, private markdown editor that lives in your browser.</strong><br />
  No sign-up. No tracking. Just write.
</p>

<p align="center">
  <a href="https://markpad.online">markpad.online</a>
</p>

---

## What is Markpad?

Markpad is a fully client-side markdown editor built for people who want a clean, fast writing experience without handing their data to a server. Everything — your documents, folders, tags, and settings — is stored locally in your browser's IndexedDB. Nothing leaves your machine.

It works offline as a Progressive Web App (PWA) and can be installed on desktop or mobile like a native application.

## Features

### Writing

- **Visual editor** — Rich block-based editing powered by BlockNote with formatting toolbar
- **Source mode** — Switch to raw markdown editing when you need precise control
- **Seamless switching** — Toggle between visual and source modes with live conversion
- **Auto-save** — Changes saved automatically as you type (500ms debounce)

### Organisation

- **Folders** — Hierarchical folder structure with nesting
- **Tags** — Color-coded tags for flexible categorisation
- **Search** — Full-text search across document titles and content
- **Sort** — By title, date created, or last updated (ascending/descending)
- **Duplicate** — Clone any document instantly

### Export

- **Markdown** (`.md`) — Raw markdown file
- **Plain text** (`.txt`) — Stripped formatting
- **Word** (`.docx`) — Full rich formatting with two templates:
  - Default (Calibri) and Professional (Garamond)
  - Supports headings, bold, italic, code, links, blockquotes, lists, and tables
- **Google Docs** — Copy to clipboard and open a new Google Doc ready to paste

### Import & Backup

- **Import** markdown and text files directly into your workspace
- **Full backup** — Export your entire workspace (documents, folders, tags, settings) as JSON
- **Restore** — Import backups with merge or replace mode

### Privacy & Offline

- **Zero tracking** — No analytics, no cookies, no server-side storage
- **Offline-first** — Works without internet once installed as a PWA
- **Local storage** — All data stays in IndexedDB on your device
- **No account required** — Open the app and start writing

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 7 |
| Editor | BlockNote 0.46 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 + Mantine 8 |
| Storage | IndexedDB (via `idb`) |
| Export | `docx` for Word, `marked` for markdown parsing, `file-saver` for downloads |
| PWA | vite-plugin-pwa with auto-update service worker |
| Hosting | Netlify |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
git clone https://github.com/kr3t3n/markpad.git
cd markpad
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
markpad/
├── src/
│   ├── components/
│   │   ├── Editor/          # EditorPage, MarkpadEditor, EditorToolbar, SourceEditor
│   │   ├── FileManager/     # FileManager, FolderSidebar, DocumentCard, ImportHandler
│   │   ├── ExportMenu/      # Export options (md, txt, docx, Google Docs)
│   │   ├── Settings/        # Theme, backup/restore, onboarding
│   │   ├── Landing/         # Marketing landing page
│   │   ├── Layout/          # App shell and navigation
│   │   └── Legal/           # Terms of Service, Privacy Policy
│   ├── hooks/
│   │   ├── useDocuments.ts  # Document CRUD, search, sort, folder/tag management
│   │   └── useTheme.ts      # Light/Dark/System theme switching
│   ├── lib/
│   │   ├── storage.ts       # IndexedDB abstraction layer
│   │   ├── export.ts        # Markdown, text, DOCX, and Google Docs export
│   │   ├── backup.ts        # Workspace backup and restore
│   │   └── import.ts        # File import handling
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   ├── App.tsx              # Router configuration
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles and CSS variables
├── public/                  # Static assets, logos, icons, OG image
├── index.html               # HTML entry with Open Graph meta
├── vite.config.ts           # Vite + Tailwind + PWA configuration
└── package.json
```

## Deployment

Markpad is deployed on Netlify. The `dist/` folder is the build output. Any push to the main branch triggers a new deployment.

## License

MIT

---

<p align="center">
  Built with care by <a href="https://github.com/kr3t3n">kr3t3n</a>
</p>
