import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Dev-only proxy to bypass CORS for external iCal endpoints.
        // Usage:
        //   1) Set VITE_ICAL_UPSTREAM to a full ICS URL (e.g., https://calendar.google.com/.../basic.ics)
        //   2) Set VITE_ICAL_URL=/ical in .env.local
        // This will proxy /ical to the upstream during `npm run dev`.
        proxy: env.VITE_ICAL_UPSTREAM
          ? {
              '/ical': {
                // Point directly to the full ICS URL
                target: env.VITE_ICAL_UPSTREAM,
                changeOrigin: true,
                secure: true,
                // IMPORTANT: drop the '/ical' path so the request hits the exact target URL
                rewrite: () => '',
                configure: (proxy) => {
                  proxy.on('proxyReq', (proxyReq) => {
                    proxyReq.setHeader('accept', 'text/calendar, */*');
                  });
                },
              },
            }
          : undefined,
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './'),
        }
      }
    };
});
