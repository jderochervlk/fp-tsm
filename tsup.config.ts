import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src'],
  splitting: false,
  sourcemap: false,
  clean: true,
  target: 'esnext',
  format: 'esm'
})
