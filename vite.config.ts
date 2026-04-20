import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'favicon.svg',
        'logo-192.svg',
        'logo-512.svg',
      ],
      manifest: {
        name: 'Caskmaf Datahub — Powering smarter, connected data commerce',
        short_name: 'Caskmaf Datahub',
        description:
          'A modern storefront for buying data bundles from trusted agents across Ghana.',
        theme_color: '#142850',
        background_color: '#142850',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/favicon.svg',               sizes: 'any',     type: 'image/svg+xml', purpose: 'any maskable' },
          { src: '/logo-192.svg',               sizes: '192x192', type: 'image/svg+xml' },
          { src: '/logo-512.svg',               sizes: '512x512', type: 'image/svg+xml' },
        ],
        categories: ['business', 'finance', 'utilities'],
        shortcuts: [
          { name: 'Dashboard', short_name: 'Dashboard', url: '/dashboard',  icons: [{ src: '/favicon.svg', sizes: 'any' }] },
          { name: 'Orders',    short_name: 'Orders',    url: '/orders',     icons: [{ src: '/favicon.svg', sizes: 'any' }] },
          { name: 'Wallet',    short_name: 'Wallet',    url: '/wallet',     icons: [{ src: '/favicon.svg', sizes: 'any' }] },
        ],
      },
      // Use injectManifest so your custom sw.ts is used as-is
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      devOptions: {
        enabled: false, // keep SW off in dev to avoid stale cache headaches
      },
    }),
  ],

  resolve: {
    alias: {
      '@':              '/src',
      '@design-system': '/src/design-system',
      '@components':    '/src/components',
      '@hooks':         '/src/hooks',
      '@utils':         '/src/utils',
      '@pages':         '/src/pages',
      '@services':      '/src/services',
      '@contexts':      '/src/contexts',
      '@providers':     '/src/providers',
      '@layouts':       '/src/layouts',
      '@assets':        '/src/assets',
      '@types':         '/src/types',
      '@routes':        '/src/routes',
    },
  },

  build: {
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons:  ['react-icons'],
          forms:  ['react-hook-form', '@hookform/resolvers', 'zod'],
          http:   ['axios', 'js-cookie'],
          query:  ['@tanstack/react-query'],
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },

  server: {
    port: 5174,
    host: true,       // expose on LAN so you can test on a real phone
    hmr: true,
    open: true,
    proxy: {
      // Forward /api calls to the Express backend (plain HTTP, no SSL)
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
});