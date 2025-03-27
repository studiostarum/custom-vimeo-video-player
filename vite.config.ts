import { defineConfig } from 'vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/auto-init.ts'),
      name: 'CustomVimeoPlayer',
      fileName: () => 'custom-vimeo-player.min.js',
      formats: ['umd']
    },
    outDir: 'dist',
    rollupOptions: {
      external: [],
      output: {
        globals: {}
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