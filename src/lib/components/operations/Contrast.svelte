<script lang="ts">
	import Slider from './ui/Slider.svelte';
	import { imageOperations } from '../../state/imageOperations';
</script>

<Slider
	bind:value={$imageOperations.contrast}
	base={0}
	min={-1}
	max={1}
	step={0.01}
	label="Contrast"
/>
