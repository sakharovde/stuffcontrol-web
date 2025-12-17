import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import checker from 'vite-plugin-checker';
// import { VitePWA } from 'vite-plugin-pwa';

const backendTarget = process.env.VITE_SERVER_ORIGIN ?? 'http://localhost:3000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: {
        tsconfigPath: 'tsconfig.app.json',
      },
    }),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   // devOptions: {
    //   //   enabled: process.env.NODE_ENV !== 'production',
    //   // },
    //   manifest: {
    //     name: 'Stuff Control',
    //     short_name: 'Stuff',
    //     theme_color: '#000000',
    //
    //     icons: [
    //       {
    //         src: '/vite.svg',
    //         sizes: '192x192',
    //         type: 'image/svg+xml',
    //       },
    //       {
    //         src: '/vite.svg',
    //         sizes: '512x512',
    //         type: 'image/svg+xml',
    //       },
    //     ],
    //   },
    // }),
  ],
  server: {
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/ping': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
});
