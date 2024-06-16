<script lang="ts">
	import { throttle } from 'lodash-es';
	import Slider from './ui/Slider.svelte';
	import { rawProcessorWorker } from '../../workers';
	import { currentImageData } from '../../state/currentImageData';
	import { imageOperationsByFilename } from '../../state/imageOperations';

	let value = imageOperationsByFilename.getOperationValue('exposure');

	const onChange = async (value: number) => {
		if ($currentImageData.fileName) {
			await rawProcessorWorker.setExposure(value);
		}
	};

	const throttledOnChange = throttle(onChange, 500);

	$: {
		throttledOnChange(value);
		imageOperationsByFilename.setOperationValue('exposure', value);
	}
</script>

<Slider bind:value base={0} min={-1} max={1} step={0.01} label="Exposure" />
