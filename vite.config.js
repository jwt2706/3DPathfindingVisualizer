import { defineConfig } from 'vite';

export default defineConfig({
  base: '/3DPathfindingVisualizer/',
  build: {
    outDir: 'dist',
    assetsInclude: ['**/*.txt'],
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
});
