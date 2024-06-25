<script lang="ts">
	import Slider from './ui/Slider.svelte';
	import { rawProcessorWorker } from '../../workers';
	import { currentImageData } from '../../state/currentImageData';
	import { createSyncedOperationControlState } from '../../state/createSyncedControlState.svelte';

	let value = createSyncedOperationControlState('contrast', async (value) => {
		if ($currentImageData.fileName) {
			await rawProcessorWorker.setContrast(value);
		}
	});
</script>

<Slider bind:value={$value} base={0} min={-1} max={1} step={0.01} label="Contrast" />
