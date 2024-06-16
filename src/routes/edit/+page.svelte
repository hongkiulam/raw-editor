<script>
	import { goto } from '$app/navigation';
	import ImageCanvas from '$lib/components/editor/ImageCanvas.svelte';
	import Exposure from '$lib/components/operations/Exposure.svelte';
	import Toolbar from '../../lib/components/editor/Toolbar.svelte';
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
		background-color: rgba(var(--bg-rgb), 0.4);
		z-index: var(--z-toolbar);
		border-bottom: 1px solid rgba(0, 0, 0, 0.2);
	}
	aside {
		position: absolute;
		top: 0;
		right: 0;
		width: var(--sidebar-width);
		height: 100%;
		margin-top: var(--toolbar-height);
		border-left: 1px solid rgba(0, 0, 0, 0.2);
		background-color: rgba(var(--bg-rgb), 0.2);
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
