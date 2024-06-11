<script>
	import { Edits } from '$lib/raw-processor';
	import ImageCanvas from '$lib/components/ImageCanvas.svelte';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import ScreenLogger from '../lib/components/ScreenLogger.svelte';
	import Exposure from '../lib/components/operations/Exposure.svelte';
	import { useRawImage } from '../lib/state/useRawImage';
	import { onMount } from 'svelte';
</script>

<main>
	<ImageCanvas />
</main>
<aside>
	<ImageUpload />
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
