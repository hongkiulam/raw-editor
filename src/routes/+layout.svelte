<script lang="ts">
	import { browser } from '$app/environment';
	import { rawProcessorWorker } from '../lib/workers';
	import '../app.css';

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
		display: grid;
		place-items: center;
	}
</style>
