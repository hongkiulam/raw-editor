<script lang="ts">
	import { throttle } from 'lodash-es';
	import Slider from './ui/Slider.svelte';
	import { rawProcessorWorker } from '../../workers';

	let value = 0;

	const onChange = async (value: number) => {
		// updateEdits('exposure', value);
		console.log('setting exposure', value);
		// TODO: i think i should store rgb state main thread side, as its useful to know
		// in cases like this where we dont run this function when it doesnt exist
		await rawProcessorWorker.setExposure(value);
	};

	const throttledOnChange = throttle(onChange, 500);

	$: {
		throttledOnChange(value);
	}
</script>

<Slider bind:value base={0} min={-1} max={1} step={0.01} label="Exposure" />
