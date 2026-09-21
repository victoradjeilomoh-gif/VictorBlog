import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the built site works at a domain root OR in a cPanel subfolder.
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
})
