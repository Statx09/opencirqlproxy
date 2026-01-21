import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allows LAN and ngrok access
    port: 5173,
    strictPort: true,
    // allow ngrok host
    allowedHosts: [
      'preinstructive-kymani-symbolically.ngrok-free.dev',
      'localhost',
      '127.0.0.1'
    ],
  },
});
