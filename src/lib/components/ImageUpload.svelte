<script lang="ts">
	import * as raw_editor from 'raw-processor';
	import { useRawImage } from '../state/currentRawImage';

	const { setRawImage } = useRawImage();
</script>

<input
	type="file"
	accept=".raw,.nef,.cr2,.arw,.dng"
	onchange={async (e) => {
		console.log(e);
		const file = e.currentTarget?.files?.[0];
		if (!file) return;
		const arrayBuffer = await file.arrayBuffer();
		const uint8Array = new Uint8Array(arrayBuffer);
		const rawImage = raw_editor.decode_raw_image(uint8Array);
		console.log('Width:', rawImage.width);
		console.log('Height:', rawImage.height);
		console.log('size', rawImage.height * rawImage.width * 3);
		console.log('metadata', rawImage.metadata);
		setRawImage(rawImage);
		// renderImageData(rawImage);
	}}
/>

<style>
	input {
		width: 100%;
	}
</style>
