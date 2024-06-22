<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import type { Action } from 'svelte/action';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let {
		children,
		use_melt = { action: () => {} },
		...restProps
	}: HTMLButtonAttributes & {
		use_melt?: any;
	} = $props();
</script>

<button {...restProps} {...use_melt} use:use_melt.action>{@render children?.()}</button>

<style>
	button {
		display: inline-block;
		padding: var(--size-1) var(--size-2);
		background: var(--surface-2);
		border: var(--border-size-1) solid var(--text-2);
		border-radius: var(--radius-2);
		font-size: var(--font-size-0);
		&[disabled] {
			opacity: 0.5;
			pointer-events: none;
		}
	}
</style>
