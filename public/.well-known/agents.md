# Markpad

## Overview
Markpad is a free, private markdown editor that runs entirely in the browser. No sign-up, no tracking, no servers — just write.

## URL
https://markpad.online

## Features
- Rich visual markdown editing with live preview
- 100% client-side — all data stays in the browser (IndexedDB)
- Works offline as a Progressive Web App (PWA)
- Folder and tag organization for documents
- Export to .md, .docx, or Google Docs
- Light/dark/system theme support
- Workspace backup and restore (JSON export/import)

## How to Use
1. Visit https://markpad.online and click "Open Markpad"
2. The editor opens at /app — create a new document or manage existing ones
3. Documents are stored locally in your browser's IndexedDB
4. Export documents via the toolbar (Markdown, Word, or Google Docs)
5. Install as a PWA for offline access

## Routes
- `/` — Landing page with product overview
- `/app` — Document manager (file list, folders, tags)
- `/app/doc/:id` — Edit a specific document
- `/app/settings` — Theme, backup/restore, about

## Privacy
Markpad stores all data locally in the browser. No data is sent to any server. No analytics, no cookies, no tracking.

## Author
Georgi Pepelyankov
- GitHub: https://github.com/kr3t3n
- X: https://x.com/georgipep

## Source Code
https://github.com/kr3t3n/markpad

## License
Open source
