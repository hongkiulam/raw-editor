<script lang="ts">
	import Slider from './ui/Slider.svelte';

	let value = 0;
</script>

<Slider bind:value base={0} min={-1} max={1} step={0.01} label="Exposure" />
