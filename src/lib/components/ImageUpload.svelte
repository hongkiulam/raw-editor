<script lang="ts">
	import { RawFile } from '$lib/raw-processor';
	import { useRawImage } from '../state/useRawImage';

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
		const rawFile = RawFile.decode(uint8Array);
		console.log('Width:', rawFile.width);
		console.log('Height:', rawFile.height);
		console.log('size', rawFile.height * rawFile.width * 3);
		console.log('metadata', rawFile.metadata);
		setRawImage(fileName, rawFile);
	}}
/>

<style>
	input {
		width: 100%;
	}
</style>
