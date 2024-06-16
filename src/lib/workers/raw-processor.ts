// 🤖 Web Worker

import * as Comlink from 'comlink';
import init, * as raw_editor from '$lib/raw-processor';
import type { Operations } from '../state/imageOperations';
import { writable } from 'svelte/store';

const workerLogger = (...args: any[]) => console.log('%c WORKER', 'color: lightblue', ...args);
let currentImageProcessor: raw_editor.ImageProcessor | undefined = undefined;

const serialisedImageData = (rawFile: raw_editor.ImageProcessor, rgba: Uint8Array) => {
	return {
		width: rawFile.width,
		height: rawFile.height,
		metadata: rawFile.metadata,
		image_as_rgba8: rgba
	};
};
export type SerialisedImageData = ReturnType<typeof serialisedImageData>;

// This store is used to keep track of the latest image data that has been processed
// We expose this via a subscribe function from the worker, the main thread can then subscribe to this store and update the UI
const latestImageData = writable<SerialisedImageData | undefined>(undefined);

/**
 * Applies the operations to the current image processor and updates the store with the new image data
 */
const applyOperations = () => {
	if (currentImageProcessor) {
		const rgba = currentImageProcessor.apply_operations();
		const serialised = serialisedImageData(currentImageProcessor, rgba);
		latestImageData.set(serialised);
		workerLogger('applied operations and updated store');
	}
};

const rawProcessorWorker = {
	/**
	 * Initialises the WASM module from inside of the worker
	 */
	init: async () => {
		await init();
	},
	/**
	 * Given some file data, decodes it and applies the operations.
	 *
	 * The resultant RGBA and image data can be retrieved with `subscribeToLatestImageData`.
	 *
	 * Creates a new ImageProcessor in the workers memory for handling the current file.
	 */
	decode: (rawFile: Uint8Array, operations: Operations) => {
		const imageProcessor = new raw_editor.ImageProcessor(rawFile);
		currentImageProcessor = imageProcessor;
		if (operations.exposure !== 0) {
			imageProcessor.set_exposure(operations.exposure);
		}
		console.log('rotation', operations.rotation);
		if (operations.rotation !== 0) {
			imageProcessor.set_rotation(operations.rotation);
		}
		applyOperations();
	},
	setExposure: (value: number) => {
		if (currentImageProcessor) {
			currentImageProcessor.set_exposure(value);
			applyOperations();
		}
	},
	setRotation: (angle: number) => {
		if (currentImageProcessor) {
			currentImageProcessor.set_rotation(angle);
			applyOperations();
		}
	},
	/**
	 * Subscribes to the latest image data that has been processed by the worker.
	 *
	 * This is used in `currentImageData` to keep the UI in sync with the latest image data
	 *
	 * Given this is exposed by the worker, the callback needs to be passed in using a Comlink helper
	 * @example
	 * const callback = Comlink.proxy((data: SerialisedImageData) => {
	 *  console.log('New image data', data);
	 * });
	 * worker.subscribeToLatestImageData(callback);
	 */
	subscribeToLatestImageData: (callback: (data: SerialisedImageData) => void) => {
		latestImageData.subscribe((latestData) => {
			if (latestData) {
				callback(latestData);
			}
		});
	}
};
export type RawProcessorWorker = Comlink.Remote<typeof rawProcessorWorker>;
Comlink.expose(rawProcessorWorker);
