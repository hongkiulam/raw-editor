<script lang="ts">
	import Slider from './ui/Slider.svelte';
	import { rawProcessorWorker } from '../../workers';
	import { currentImageData } from '../../state/currentImageData';
	import { createSyncedOperationControlState } from '../../state/createSyncedControlState.svelte';

	let value = createSyncedOperationControlState('exposure', async (value) => {
		if ($currentImageData.fileName) {
			await rawProcessorWorker.setExposure(value);
		}
	});
</script>

<Slider bind:value={$value} base={0} min={-2} max={2} step={0.01} label="Exposure" />
