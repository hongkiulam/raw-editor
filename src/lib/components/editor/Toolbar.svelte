<script lang="ts">
	import { createToolbar, melt } from '@melt-ui/svelte';
	import { currentImageData } from '../../state/currentImageData';
	import { canvasState } from '../../state/canvas';

	const {
		elements: { root, button, link, separator },
		builders: { createToolbarGroup }
	} = createToolbar();
</script>

<div class="toolbar" use:melt={$root}>
	<button
		use:melt={$button}
		onclick={() => {
			currentImageData.reset();
			canvasState.resetInteractions();
		}}
	>
		Back
	</button>
	<button
		use:melt={$button}
		onclick={() => {
			canvasState.resetInteractions();
		}}
	>
		Reset Zoom
	</button>
	<button disabled use:melt={$button}>Export</button>
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
