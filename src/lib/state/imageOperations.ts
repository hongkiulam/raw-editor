import { get, writable } from 'svelte/store';
import { currentImageData } from './currentImageData';
import { rawProcessorWorker } from '../workers';
import { throttle } from 'lodash-es';

export interface Operations {
	exposure: number;
	rotation: number;
	contrast: number;
}

const defaultOperations: Operations = {
	exposure: 0,
	rotation: 0,
	contrast: 0
};

const isomorphicLocalStorage =
	typeof window === 'undefined'
		? {
				getItem: () => null,
				setItem: () => void 0
			}
		: window.localStorage;
const LOCAL_STORAGE_KEY = 'imageOperations';

const getFileName = () => get(currentImageData)?.fileName;
const getPersistedOperations = (fileName: string) => {
	const persisted = isomorphicLocalStorage.getItem(LOCAL_STORAGE_KEY + `_${fileName}`);
	return persisted ? (JSON.parse(persisted) as Operations) : null;
};

const queueApplyOperations = throttle(
	(operations: Operations) => rawProcessorWorker.setAndApplyOperations(operations),
	500
);

const createImageOperationsStore = () => {
	const _imageOperations = writable<Operations>();

	_imageOperations.subscribe((value) => {
		// 👇 Sync with localstorage
		if (value) {
			isomorphicLocalStorage.setItem(
				LOCAL_STORAGE_KEY + `_${getFileName()}`,
				JSON.stringify(value)
			);
			// 👇 Queue operations to be applied any time the operations change
			queueApplyOperations(value);
		}
	});

	const retrieveOrInitialiseOperations = (fileName: string) => {
		const existingOperations = getPersistedOperations(fileName) || {};
		const retrievedOrInitialisedOperations = { ...defaultOperations, ...existingOperations }; // 👈 This ensures that if new operations are added, they are backfilled to existing cache
		_imageOperations.set(retrievedOrInitialisedOperations);
		return retrievedOrInitialisedOperations;
	};

	const resetOperations = () => {
		_imageOperations.set({ ...defaultOperations });
	};

	return {
		..._imageOperations,
		retrieveOrInitialiseOperations,
		resetOperations
	};
};

export const imageOperations = createImageOperationsStore();
