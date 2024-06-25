import { writable } from 'svelte/store';
import * as Comlink from 'comlink';
import type { SerialisedImageData } from '../workers/raw-processor';
import { rawProcessorWorker } from '../workers';
import { imageOperationsByFilename } from './imageOperations';

interface CurrentImageDataState {
	fileName: string;
	image?: SerialisedImageData;
}

const logger = (...args: unknown[]) =>
	console.log('%c CURRENT IMAGE DATA', 'color: lightgreen', ...args);
const createCurrentImageDataStore = () => {
	const { subscribe, update, set } = writable<CurrentImageDataState>({ fileName: '' });

	// This code here syncs the latest image data from the worker to the currentImageData store, this allows us to
	// write UI based on the latest image data i.e. rendering canvas, hiding control fields when not available
	const latestImageDataCallback = Comlink.proxy((data: SerialisedImageData) => {
		update((state) => {
			state.image = data;
			return state;
		});
	});
	rawProcessorWorker.subscribeToLatestImageData(latestImageDataCallback);

	const setNewFile = async (fileName: string, fileData: Uint8Array) => {
		logger('Handling new file', fileName);
		const operations = imageOperationsByFilename.retrieveOrInitialiseOperations(fileName);
		logger('Got operations', operations);
		await rawProcessorWorker.decode(fileData, operations);
		logger('File decoded');

		update((state) => {
			state.fileName = fileName;
			return state;
		});
	};

	const reset = () => {
		set({ fileName: '' });
		logger('Resetting current image data');
	};

	return {
		subscribe,
		update,
		set,
		reset,
		setNewFile
	};
};

/**
 * ℹ️ A light wrapper around the latestImageData store provided by the worker
 * This allows us to use that data from the main thread in the UI code
 * e.g.
 * - Hide elements when there is no data
 * - Render the canvas with the latest image data
 */
export const currentImageData = createCurrentImageDataStore();
