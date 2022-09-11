import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'index',
      fileName: 'index'
    },
    outDir: resolve(__dirname, './dist'),
  },
  // resolve: {
  //     alias: [
  //         // put your alias here
  //     ]
  // },
  plugins: [react()],
  // rollupOptions: {
  //   external: ['react', 'react-dom'],
  //   output: {
  //       globals: {
  //           react: 'React',
  //           'react-dom': 'ReactDOM',
  //           'styled-components': 'styled',
  //       },
  //   },
  // }
})
