import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'index',
      // the proper extensions will be added
      fileName: 'index'
    },
	
	outDir: resolve(__dirname, './dist'),
    // rollupOptions: {
    //   output: {
	// 	dir: './dist',
    //   }
    // }
  }
  // resolve: {
    //     alias: [
    //         // put your alias here
    //     ]
    // },
})
