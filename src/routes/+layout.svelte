<script lang="ts">
	import { browser } from '$app/environment';
	import { currentImageData } from '../lib/state/currentImageData';
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
	@import '../app.css';
</style>
