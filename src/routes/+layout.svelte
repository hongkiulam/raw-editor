<script lang="ts">
	import { browser } from '$app/environment';
	import { rawProcessorWorker } from '../lib/workers';
	const { children } = $props();

	const initialiseWasm = async () => {
		await rawProcessorWorker.init();
	};
	const isomorphicInitWasm = !browser ? new Promise(() => {}) : initialiseWasm();
</script>

<!-- TODO: move this to +page so we show the loading state inside of the UI layout -->
{#await isomorphicInitWasm}
	<p>loading...</p>
{:then}
	{@render children()}
{:catch}
	<p>failed to load raw-processor</p>
{/await}

<style>
	:global(body) {
		width: 100%;
		height: 100vh;
		font-family: 'Roboto', sans-serif;
		background: rgb(var(--bg-rgb));
		background-image: radial-gradient(black 1px, transparent 0);
		background-size: 40px 40px;
		background-position: -19px -19px;
		overflow: hidden;
	}
	:global(*) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
		outline: 1px solid rgba(0, 0, 0, 0.1);
	}
	:global(:root) {
		--bg-rgb: 255, 255, 255;
		--z-base: 0;
		--z-above: 1;
		--z-controls: calc(var(--z-above) + var(--z-canvas));
		--z-canvas: calc(var(--z-above) + var(--z-base));
	}
</style>
