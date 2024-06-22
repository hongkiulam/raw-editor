<script>
	import { createSyncedOperationControlState } from '../../state/createSyncedControlState.svelte';
	import { currentImageData } from '../../state/currentImageData';
	import { rawProcessorWorker } from '../../workers';
	import Button from '../Button.svelte';

	let value = createSyncedOperationControlState('rotation', async (value) => {
		if ($currentImageData.fileName) {
			await rawProcessorWorker.setRotation(value);
		}
	});
</script>

<Button
	onclick={() => {
		$value = ($value + 90) % 360;
	}}
>
	Rotate
</Button>
