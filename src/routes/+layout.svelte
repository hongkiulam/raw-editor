<script lang="ts">
	import { onMount } from 'svelte';
	onMount(() => {
		import('$lib/app');
	});

	const { children } = $props();
</script>

{@render children()}
