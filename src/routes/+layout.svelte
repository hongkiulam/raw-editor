<script lang="ts">
	import { onMount } from 'svelte';
	onMount(() => {
		import('$lib/app');
	});

	const { children } = $props();
</script>

{@render children()}

<style>
	:global(body) {
		width: 100%;
		height: 100vh;
		font-family: 'Roboto', sans-serif;
		background: rgb(var(--bg-rgb));
		background-image: radial-gradient(black 1px, transparent 0);
		background-size: 40px 40px;
		background-position: -19px -19px;
	}
	:global(*) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
		outline: 1px solid rgba(0, 0, 0, 0.1);
	}
	:global(:root) {
		--bg-rgb: 255, 255, 255;
	}
</style>
