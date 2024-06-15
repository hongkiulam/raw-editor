import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit()
		// https://vite-pwa-org.netlify.app/frameworks/sveltekit
	],
	server: {
		// allow SharedArrayBuffer usage
		// Not needed ATM
		// headers: {
		// 	'Cross-Origin-Opener-Policy': 'same-origin',
		// 	'Cross-Origin-Embedder-Policy': 'require-corp'
		// }
	}
});
