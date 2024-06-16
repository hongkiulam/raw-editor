<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentImageData } from '../state/currentImageData';
	let loading = $state(false);
</script>

<label class:disabled={loading}>
	<span>
		Upload an image {loading ? '...' : ''}
	</span>
	<input
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
	span {
		cursor: pointer;
		display: inline-block;
		padding: var(--space-2) var(--space-3);
		border: 1px solid #000;
		border-radius: 4px;
		background-color: #f0f0f0;
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
