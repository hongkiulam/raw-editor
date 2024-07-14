<script lang="ts">
	import { createToolbar, melt } from '@melt-ui/svelte';
	import { currentImageData } from '../../state/currentImageData';
	import { canvasState } from '../../state/canvas';
	import Button from '../Button.svelte';
	import { imageOperations } from '../../state/imageOperations';

	const {
		elements: { root, button, link, separator },
		builders: { createToolbarGroup }
	} = createToolbar();
</script>

<div class="toolbar" use:melt={$root}>
	<Button
		use_melt={$button}
		onclick={() => {
			currentImageData.reset();
			canvasState.resetInteractions();
		}}
	>
		Back
	</Button>
	<Button
		use_melt={$button}
		onclick={() => {
			canvasState.resetInteractions();
		}}
	>
		Reset Zoom
	</Button>
	<Button
		use_melt={$button}
		onclick={() => {
			imageOperations.resetOperations();
		}}
	>
		Reset Adjustments
	</Button>
	<Button disabled use_melt={$button}>Export</Button>
</div>

<style>
	.toolbar {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
