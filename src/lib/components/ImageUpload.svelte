<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentImageData } from '../state/currentImageData';
</script>

<input
	type="file"
	accept=".raw,.nef,.cr2,.arw,.dng"
	onchange={async (e) => {
		const file = e.currentTarget?.files?.[0];
		if (!file) return;
		const fileName = file.name;
		const arrayBuffer = await file.arrayBuffer();
		const uint8Array = new Uint8Array(arrayBuffer);
		await currentImageData.setNewFile(fileName, uint8Array);
		goto('/edit');
	}}
/>

<style>
	input {
		width: 100%;
	}
</style>
