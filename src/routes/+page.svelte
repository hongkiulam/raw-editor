<script lang="ts">
	import { onMount } from 'svelte';
	import * as Comlink from 'comlink';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import { rawProcessorWorker } from '../lib/workers';

	let decodeProgressEvents: string[] = $state([]);
	onMount(() => {
		const listener = Comlink.proxy((newEvent: string) => {
			decodeProgressEvents = [newEvent, ...decodeProgressEvents];
		});
		rawProcessorWorker.subscribeToDecodeProgress(listener);
	});
</script>

<main>
	<ImageUpload />
	<aside>
		<ul>
			{#each decodeProgressEvents as event}
				<li>{event}</li>
			{/each}
		</ul>
	</aside>
</main>

<style>
	main {
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
	}
</style>
