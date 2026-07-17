<<<<<<< HEAD
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    port: 5273,
    strictPort: true,

    // Allow requests from LocalTunnel, ngrok, etc.
    allowedHosts: true,

    proxy: {
      '/api/v1': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/api/aiassistant': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
        changeOrigin: true,
      },
    },
  },

=======
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5273,
    strictPort: true,
    host: true,
    proxy: {
      '/api/v1': { target: 'http://localhost:4000', changeOrigin: true },
      '/api/aiassistant': { target: 'http://localhost:8000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:4000', ws: true, changeOrigin: true },
    },
  },
>>>>>>> a889bc0b181d7b2816aace56caa512867949f625
  build: {
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    target: 'es2020',
    cssMinify: true,
    reportCompressedSize: false,
<<<<<<< HEAD

=======
>>>>>>> a889bc0b181d7b2816aace56caa512867949f625
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
<<<<<<< HEAD
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            if (id.includes('@dnd-kit')) {
              return 'vendor-dnd';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (
              id.includes('react-markdown') ||
              id.includes('remark') ||
              id.includes('mdast')
            ) {
              return 'vendor-md';
            }
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('scheduler')
            ) {
              return 'vendor-react';
            }
            if (id.includes('socket.io-client')) {
              return 'vendor-socket';
            }

=======
            if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
            if (id.includes('@dnd-kit')) return 'vendor-dnd';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('mdast')) return 'vendor-md';
            if (id.includes('date-fns')) return 'vendor-date';
            if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';
            if (id.includes('socket.io-client')) return 'vendor-socket';
>>>>>>> a889bc0b181d7b2816aace56caa512867949f625
            return 'vendor';
          }
        },
      },
    },
  },
<<<<<<< HEAD
});
=======
});
>>>>>>> a889bc0b181d7b2816aace56caa512867949f625
