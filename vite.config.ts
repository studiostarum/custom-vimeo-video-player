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
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'cjs', 'umd']
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['@vimeo/player'],
      output: {
        globals: {
          '@vimeo/player': 'Vimeo'
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