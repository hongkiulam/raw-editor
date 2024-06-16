<script>
	import { createSyncedOperationControlState } from '../../state/createSyncedControlState.svelte';
	import { currentImageData } from '../../state/currentImageData';
	import { rawProcessorWorker } from '../../workers';

	let value = createSyncedOperationControlState('rotation', async (value) => {
		console.log(value);
		if ($currentImageData.fileName) {
			await rawProcessorWorker.setRotation(value);
		}
	});

	$: console.log($value);
</script>

<button
	onclick={() => {
		$value = ($value + 90) % 360;
	}}
>
	Rotate
</button>
