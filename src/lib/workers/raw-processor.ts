// 🤖 Web Worker

import * as Comlink from 'comlink';
import init, * as raw_editor from '$lib/raw-processor';
import type { Operations } from '../state/imageOperations';
import { writable } from 'svelte/store';
import { DecodeEvent, type DecodeEventName } from '../helpers/decodeEvents';

const workerLogger = <Arg>(...args: Arg[]) => console.log('%c WORKER', 'color: lightblue', ...args);
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
		if (operations.rotation !== 0) {
			imageProcessor.set_rotation(operations.rotation);
		}
		if (operations.contrast !== 0) {
			imageProcessor.set_contrast(operations.contrast);
		}
		applyOperations();
	},
	/**
	 * Loads the current raw file with the operations provided, and applies the operations.
	 * After applying the operations, the latest image data becomes available via `subscribeToLatestImageData`.
	 */
	setAndApplyOperations: (operations: Operations) => {
		if (currentImageProcessor) {
			currentImageProcessor.set_exposure(operations.exposure);
			currentImageProcessor.set_contrast(operations.contrast);
			currentImageProcessor.set_rotation(operations.rotation);
			// currentImageProcessor.set_saturation(operations.saturation);
			applyOperations();
		}
	},
	/** @deprecated */
	setExposure: (value: number) => {
		if (currentImageProcessor) {
			currentImageProcessor.set_exposure(value);
			applyOperations();
		}
	},
	/** @deprecated */
	setContrast: (value: number) => {
		if (currentImageProcessor) {
			currentImageProcessor.set_contrast(value);
			applyOperations();
		}
	},
	/** @deprecated */
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
	},
	/**
	 * Subscribes to decode progress.
	 *
	 * Given this is exposed by the worker, the callback needs to be passed in using a Comlink helper
	 * @example
	 * const callback = Comlink.proxy((data: string) => {
	 *  console.log('New event', data);
	 * });
	 * worker.subscribeToDecodeProgress(callback);
	 */
	subscribeToDecodeProgress: (callback: (data: DecodeEventName) => void) => {
		Object.values(DecodeEvent).forEach((EVENT_NAME) => {
			self.addEventListener(
				EVENT_NAME,
				() => {
					callback(EVENT_NAME);
				},
				{ once: true }
			);
		});
	}
};
export type RawProcessorWorker = Comlink.Remote<typeof rawProcessorWorker>;
Comlink.expose(rawProcessorWorker);
