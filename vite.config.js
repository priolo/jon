/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts';


export default defineConfig({
	plugins: [
		react(),
		dts({ insertTypesEntry: true }),
	],
	build: {
		sourcemap: true,
		lib: {
			entry: 'src/index.ts',
			name: 'Jon',
			formats: ['es', 'umd'],
			fileName: (format) => `index.${format}.js`,
		},
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
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/tests/setup.ts',
		// you might want to disable it, if you don't have tests that rely on CSS
		// since parsing CSS is slow
		css: false,
	},
})
