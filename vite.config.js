import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'Jon',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`,
    },
    //outDir: resolve(__dirname, './dist'),
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  // resolve: {
  //     alias: [
  //         // put your alias here
  //     ]
  // },

})
