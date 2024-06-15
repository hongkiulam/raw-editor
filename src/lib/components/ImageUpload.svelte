<script lang="ts">
	import { rawProcessorWorker } from '../workers';
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
		await rawProcessorWorker.decode(uint8Array);
	}}
/>

<style>
	input {
		width: 100%;
	}
</style>
