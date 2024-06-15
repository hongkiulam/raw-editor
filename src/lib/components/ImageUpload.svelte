<script lang="ts">
	import { RawFile } from '$lib/raw-processor';
	import { useRawImage } from '../state/useRawImage';
	import { rawProcessorWorker } from '../workers';
	// import { rawProcessorCall } from '../workers';

	const { setRawImage } = useRawImage();
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
		// TODO: classes are not transferable from worker. so rawFile.width and rawFile.height are undefined
		// TODO: best to just transfer the rgb image data, but we'll still need to figure out who owns the WASM classes
		// const rawFile = await rawProcessorCall('decode', uint8Array);
		// // const rawFile = RawFile.decode(uint8Array);
		// console.log('Width:', rawFile.width);
		// console.log('Height:', rawFile.height);
		// console.log('size', rawFile.height * rawFile.width * 3);
		// console.log('metadata', rawFile.metadata);
		// setRawImage(fileName, rawFile);
	}}
/>

<style>
	input {
		width: 100%;
	}
</style>
