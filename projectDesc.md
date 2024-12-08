# Markpad - Free Markdown Editor

## Overview

Markpad is a modern, feature-rich markdown editor built with React and TypeScript. It provides a seamless writing experience with real-time preview, rich formatting options, cloud storage, and multiple export capabilities. The application offers both free and premium features, with cloud sync and document management available for premium users.

## Features

### Core Features
### Rich Text Editing
- Real-time markdown preview
- Keyboard shortcuts for common formatting
- Support for headers, lists, code blocks, and more
- Syntax highlighting for code blocks
- Inline HTML support
- Copy formatted text or markdown

### Text Formatting Options
- Bold, italic, and underline
- Strikethrough text
- Superscript and subscript
- Multiple heading levels (H1-H3)
- Ordered and unordered lists
- Code blocks with syntax highlighting
- Hyperlinks

### Premium Features
- Cloud synchronization
- Multiple document management
- Secure document storage
- Real-time autosave
- Document organization

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
- Copy buttons for both markdown and formatted text
- Confirmation modals
- Toast notifications

### Authentication
- Email-based authentication
- Email verification
- Password reset functionality
- Protected routes

### Additional Pages
- Terms of Service
- Privacy Policy
- Contact Form
- My Documents (Premium)

## Technical Stack

### Core Technologies
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- React Router DOM

### Key Dependencies
- marked: Markdown parsing and rendering
- docx: Word document generation
- file-saver: File download handling
- lucide-react: Icon components
- sonner: Toast notifications
- js-cookie: Persistent storage
- react-router-dom: Routing
- @supabase/supabase-js: Backend integration

### Development Tools
- ESLint
- PostCSS
- Autoprefixer
- TypeScript ESLint
- Tailwind Forms
- Tailwind Typography

## Project Structure

```
src/
├── components/         # React components
│   ├── Editor.tsx     # Main editor component
│   ├── Header.tsx     # App header
│   ├── Footer.tsx     # App footer
│   ├── Modal.tsx      # Confirmation dialogs
│   ├── CopyButton.tsx # Copy functionality
│   └── ...           # Other components
├── pages/             # Route pages
│   ├── Terms.tsx      # Terms of service
│   ├── Privacy.tsx    # Privacy policy
│   ├── Contact.tsx    # Contact form
│   ├── Documents.tsx  # Document management
│   └── Auth.tsx       # Authentication
├── hooks/             # Custom React hooks
├── lib/               # Core utilities
│   ├── supabase.ts    # Supabase client
│   └── database.ts    # Database operations
├── types/             # TypeScript types
├── utils/             # Utility functions
│   ├── markdown.ts    # Markdown processing
│   ├── export.ts      # Export functionality
│   └── documentFormatter.ts  # Document formatting
└── main.tsx          # Application entry point

## Database Schema

### Profiles Table
- User profile management
- Subscription status tracking
- Stripe integration ready

### Documents Table
- Document storage
- Automatic timestamps
- Row-level security
- User ownership
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