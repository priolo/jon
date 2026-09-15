/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'

const reactExternals = ['react', 'react-dom']

export default defineConfig({
	plugins: [
		react(),
		dts({ exclude: ['src/tests/**', '**/*.test.*'] }),
	],
	build: {
		sourcemap: true,
		lib: {
			entry: 'src/index.ts',
			name: 'Jon',
			formats: ['es', 'umd'],
			fileName: (format) => `index.${format}.js`,
		},
		rolldownOptions: {
			external: (id) =>
				reactExternals.includes(id) ||
				id.startsWith('react/') ||
				id.startsWith('react-dom/') ||
				id.endsWith('.test.ts') ||
				id.endsWith('.test.jsx'),
			output: {
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
					'react/jsx-runtime': 'React',
					'react/jsx-dev-runtime': 'React',
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
