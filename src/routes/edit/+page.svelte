<script>
	import { goto } from '$app/navigation';
	import ImageCanvas from '$lib/components/editor/ImageCanvas.svelte';
	import Exposure from '$lib/components/operations/Exposure.svelte';
	import Contrast from '$lib/components/operations/Contrast.svelte';
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
			<Contrast />
			<Rotation />
		</aside>
	</div>
{/if}

<style>
	div {
		display: contents;
	}

	menu {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: var(--toolbar-height);
		z-index: var(--z-toolbar);
		border-bottom: var(--border-size-2) solid var(--surface-2);
	}
	aside {
		position: absolute;
		top: 0;
		right: 0;
		width: var(--sidebar-width);
		height: 100%;
		margin-top: var(--toolbar-height);
		border-left: var(--border-size-2) solid var(--surface-2);
		z-index: var(--z-controls);
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
		align-items: center;
		padding: var(--size-1);
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
