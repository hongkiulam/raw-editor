import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import copyWasmToNodeModulesFolder from 'vite-plugin-wasm-pack'

export default defineConfig({
	plugins: [sveltekit(),
		copyWasmToNodeModulesFolder('./raw-processor')
	]
});
