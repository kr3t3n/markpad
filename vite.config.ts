import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'icons/*.png', 'apple-touch-icon.png', 'logo.png', 'logo-white.png', 'logo-dark.png', 'og-image.png'],
      manifest: {
        name: 'Markpad — Simple and Beautiful Markdown Editor',
        short_name: 'Markpad',
        description: 'A free, private markdown editor that lives in your browser. No sign-up, no tracking — just write.',
        theme_color: '#111111',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/app',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
