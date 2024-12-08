# Markpad

<div align="center">
  <h3>A beautiful, free markdown editor for everyone</h3>
  <p>Write markdown with real-time preview, rich formatting, and multiple export options.</p>
</div>

## ✨ Features

- 📝 Real-time markdown preview
- ⌨️ Keyboard shortcuts for quick formatting
- 🎨 Dark/Light mode
- 💾 Auto-save content
- 📱 Responsive design
- 🔄 Vertical/Horizontal split layout
- 📋 Copy markdown or formatted text
- 📤 Export to multiple formats:
  - Markdown (.md)
  - Plain Text (.txt)
  - Word Document (.docx)
  - OpenDocument (.odt)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎯 Usage

1. Start typing in the editor panel
2. Use the toolbar or keyboard shortcuts for formatting
3. See your formatted text in real-time in the preview panel
4. Copy either markdown or formatted text
5. Export your document in your preferred format

### ⌨️ Keyboard Shortcuts

- **Bold**: Ctrl/Cmd + B
- **Italic**: Ctrl/Cmd + I
- **Underline**: Ctrl/Cmd + U
- **Code Block**: Ctrl/Cmd + `
- **Link**: Ctrl/Cmd + K
- **Heading 1**: Ctrl/Cmd + 1
- **Heading 2**: Ctrl/Cmd + 2
- **Heading 3**: Ctrl/Cmd + 3
- **Strikethrough**: Ctrl/Cmd + S
- **Bullet List**: Ctrl/Cmd + 8
- **Numbered List**: Ctrl/Cmd + 9
- **Superscript**: Ctrl/Cmd + 6
- **Subscript**: Ctrl/Cmd + 5

## 🛠️ Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Marked (Markdown parsing)
- DocX (Word document generation)

## 📁 Project Structure

```
markpad/
├── src/
│   ├── components/    # React components
│   ├── pages/        # Route pages
│   ├── hooks/        # Custom React hooks
│   ├── utils/        # Utility functions
│   └── main.tsx      # Entry point
├── public/           # Static assets
└── dist/            # Production build
```

## 🎨 Customization

### Adding Custom Themes

The app uses Tailwind CSS for styling. Customize the theme in `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      // Add your custom colors, fonts, etc.
    }
  }
}
```

### Adding Icons

We use Lucide React for icons. Import icons from 'lucide-react':

```tsx
import { Bold, Italic, Link } from 'lucide-react';
```

## 🔒 Privacy

- All content is stored locally in your browser
- No data is sent to any servers
- Your privacy is our priority

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

Free to use and open to everyone.

## 👨‍💻 Author

Created by [Georgi](https://x.com/georgipep) from Mangia Studios Limited.

## ❤️ Support

If you find Markpad useful, consider [buying me a coffee](https://www.buymeacoffee.com/georgipep) ☕