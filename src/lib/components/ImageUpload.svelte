<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentImageData } from '../state/currentImageData';
	import Button from './Button.svelte';
	let loading = $state(false);
	let inputElement: HTMLInputElement | null = null;
</script>

<label>
	<Button
		disabled={loading}
		onclick={() => {
			inputElement?.click();
		}}
	>
		Upload an image {loading ? '...' : ''}
	</Button>
	<input
		bind:this={inputElement}
		type="file"
		accept=".raw,.nef,.cr2,.arw,.dng"
		onchange={async (e) => {
			const file = e.currentTarget?.files?.[0];
			if (!file) return;
			const fileName = file.name;
			const arrayBuffer = await file.arrayBuffer();
			const uint8Array = new Uint8Array(arrayBuffer);
			loading = true;
			try {
				await currentImageData.setNewFile(fileName, uint8Array);
				goto('/edit');
			} finally {
				loading = false;
			}
		}}
	/>
</label>

<style>
	label {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	label.disabled {
		pointer-events: none;
		opacity: 0.5;
	}
	input {
		height: 0;
		width: 0;
		visibility: hidden;
	}
</style>
