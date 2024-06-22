<script>
	import { goto } from '$app/navigation';
	import ImageCanvas from '$lib/components/editor/ImageCanvas.svelte';
	import Exposure from '$lib/components/operations/Exposure.svelte';
	import Toolbar from '../../lib/components/editor/Toolbar.svelte';
	import Rotation from '../../lib/components/operations/Rotation.svelte';
	import { currentImageData } from '../../lib/state/currentImageData';

	$effect(() => {
		if (!$currentImageData.fileName) {
			goto('/');
		}
	});
</script>

{#if $currentImageData.fileName}
	<div style:--toolbar-height={'56px'} style:--sidebar-width={'224px'}>
		<menu class="translucent-glass">
			<Toolbar />
		</menu>
		<main>
			<ImageCanvas />
		</main>
		<aside class="translucent-glass">
			<Exposure />
			<Rotation />
		</aside>
	</div>
{/if}

<style>
	div {
		display: contents;
	}
	.translucent-glass {
		backdrop-filter: blur(50px);
	}
	menu {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: var(--toolbar-height);
		background-color: hsl(var(--surface-2-hsl) / 40%);
		z-index: var(--z-toolbar);
		/* TODO */
		border-bottom: 2px solid rgba(0, 0, 0);
	}
	aside {
		position: absolute;
		top: 0;
		right: 0;
		width: var(--sidebar-width);
		height: 100%;
		margin-top: var(--toolbar-height);
		background-color: hsl(var(--surface-1-hsl) / 20%);
		/* TODO */
		border-left: 2px solid rgba(0, 0, 0);
		z-index: var(--z-controls);
	}
	main {
		display: grid;
		place-items: center;
		padding-right: var(--sidebar-width);
		padding-top: var(--toolbar-height);
		width: 100%;
		height: 100%;
	}
</style>
