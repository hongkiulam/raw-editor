<script lang="ts">
	import { onMount } from 'svelte';
	import Slider from './ui/Slider.svelte';
	import { useRawImage } from '../../state/useRawImage';

	const { updateEdits, edits } = useRawImage();
	let value = 0;

	const onChange = (value: number) => {
		updateEdits('exposure', value);
	};

	$: {
		onChange(value);
	}

	$: console.log($edits?.exposure);
</script>

<Slider bind:value base={0} min={-1} max={1} step={0.01} label="Exposure" />
