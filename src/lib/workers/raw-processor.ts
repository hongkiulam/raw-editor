import * as Comlink from 'comlink';
import init, * as raw_editor from '$lib/raw-processor';
import { get, writable } from 'svelte/store';

// worker.ts
let currentImageProcessor: raw_editor.ImageProcessor | undefined = undefined;
const currentRGBA = writable<Uint8Array | undefined>(undefined);

const serialisedImageData = (rawFile: raw_editor.ImageProcessor, rgba: Uint8Array) => {
	return {
		width: rawFile.width,
		height: rawFile.height,
		metadata: rawFile.metadata,
		image_as_rgba8: rgba
	};
};
export type SerialisedImageData = ReturnType<typeof serialisedImageData>;

const rawProcessorWorker = {
	init: async () => {
		await init();
	},
	decode: (rawFile: Uint8Array) => {
		const imageProcessor = new raw_editor.ImageProcessor(rawFile);
		currentImageProcessor = imageProcessor;
		const rgba = imageProcessor.apply_operations();
		currentRGBA.set(rgba);
		return rgba;
		// return serialisedImageData(decodedRawFile);
	},
	subscribeToRGBA: (callback: (rgba: SerialisedImageData) => void) => {
		currentRGBA.subscribe((rgba) => {
			if (currentImageProcessor && rgba) {
				const imageData = serialisedImageData(currentImageProcessor, rgba);
				callback(imageData);
			}
		});
	},
	setExposure: (value: number) => {
		if (currentImageProcessor) {
			currentImageProcessor.set_exposure(value);
			const rgba = currentImageProcessor.apply_operations();
			console.log(rgba);
			currentRGBA.set(rgba);
		}
	}
};
export type RawProcessorWorker = Comlink.Remote<typeof rawProcessorWorker>;
Comlink.expose(rawProcessorWorker);
