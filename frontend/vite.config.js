import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Animation library
          'vendor-motion': ['framer-motion'],
          // UI icons
          'vendor-icons': ['lucide-react'],
          // Markdown / code highlighting
          'vendor-markdown': ['react-markdown', 'react-syntax-highlighter'],
          // Date helpers
          'vendor-date': ['date-fns'],
          // Toast notifications
          'vendor-toast': ['react-toastify'],
        },
      },
    },
  },
})
