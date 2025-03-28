import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CustomVimeoPlayer',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => {
        switch (format) {
          case 'es':
            return 'index.js'
          case 'cjs':
            return 'index.cjs'
          case 'umd':
            return 'custom-vimeo-player.min.js'
        }
      }
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['@vimeo/player'],
      output: {
        globals: {
          '@vimeo/player': 'Vimeo'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'custom-vimeo-player.css';
          }
          return assetInfo.name;
        }
      }
    },
    sourcemap: true,
    cssCodeSplit: false
  },
  server: {
    port: 3000,
    open: true
  }
}) 