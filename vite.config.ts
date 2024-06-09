import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	resolve: {
		alias: {
			$lib: '/src/lib'
		}
	},
	plugins: [
		svelte()
		// https://vite-pwa-org.netlify.app/frameworks/sveltekit
	]
});
