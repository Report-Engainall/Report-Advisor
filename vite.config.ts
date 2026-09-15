import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@/lib/queries', replacement: fileURLToPath(new URL('./src/lib/queries-compat.ts', import.meta.url)) },
      { find: 'pdfjs-dist/build/pdf.worker.mjs', replacement: 'pdfjs-dist/legacy/build/pdf.worker.mjs' },
      { find: 'pdfjs-dist', replacement: 'pdfjs-dist/legacy/build/pdf.mjs' },
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-xlsx': ['xlsx'],
        },
      },
    },
  },
});
