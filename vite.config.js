import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        chat: 'chat.html',
        admin: 'admin.html',
        adminLogin: 'admin-login.html'
      }
    }
  },
  preview: {
    port: 4173,
    host: true
  }
})