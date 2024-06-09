<script lang="ts">
	const browser = typeof window !== 'undefined';
	import init from 'raw-processor';

	const { children } = $props();

	const initialiseWasm = !browser ? new Promise(() => {}) : init();
</script>

<!-- TODO: move this to +page so we show the loading state inside of the UI layout -->
{#await initialiseWasm}
	<p>loading...</p>
{:then}
	{@render children()}
{:catch}
	<p>failed to load raw-processor</p>
{/await}

<style>
</style>
