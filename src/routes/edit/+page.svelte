<script>
	import { goto } from '$app/navigation';
	import ImageCanvas from '$lib/components/editor/ImageCanvas.svelte';
	import Exposure from '$lib/components/operations/Exposure.svelte';
	import { currentImageData } from '../../lib/state/currentImageData';

	$effect(() => {
		if (!$currentImageData.fileName) {
			goto('/');
		}
	});
</script>

{#if $currentImageData.fileName}
	<main>
		<ImageCanvas />
	</main>
	<aside>
		<Exposure />
		<button
			onclick={() => {
				// console.log($edits);
				// console.log($decodedImage?.process_edits($edits));
				// const edits = new Edits();
				// console.log($rawImage?.edits);
				// if ($rawImage) {
				// 	$rawImage.edits.exposure = 0.5;
				// }
				// console.log($rawImage?.edits);
			}}
		>
			change edits
		</button>
		<button
			id="button"
			onclick={() => {
				// operations.rotate();
				// $decodedImage;
			}}>rotate</button
		>
		<button
			id="button"
			onclick={() => {
				// operations.increaseExposure();
			}}>increase exposure</button
		>
		<!-- <ScreenLogger /> -->
	</aside>
{/if}

<style>
	aside {
		position: absolute;
		top: 0;
		right: 0;
		width: 224px;
		height: 100%;
		border-left: 1px solid rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(50px);
		background-color: rgba(var(--bg-rgb), 0.1);
		z-index: var(--z-controls);
	}
	main {
		display: grid;
		place-items: center;
		padding-right: 224px;
		width: 100%;
		height: 100%;
	}
</style>
