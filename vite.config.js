import { defineConfig } from 'vite';

export default defineConfig({
  base: '/3DMazePathfinding/',
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
