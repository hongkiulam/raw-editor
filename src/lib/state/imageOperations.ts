import { derived, get, writable } from 'svelte/store';
import { currentImageData } from './currentImageData';

export interface Operations {
	exposure: number;
}

const defaultOperations: Operations = {
	exposure: 0
};

const isomorphicLocalStorage =
	typeof window === 'undefined'
		? {
				getItem: () => null,
				setItem: () => void 0
			}
		: window.localStorage;
const LOCAL_STORAGE_KEY = 'imageOperations';
const persisted = isomorphicLocalStorage.getItem(LOCAL_STORAGE_KEY);

const getFileName = () => get(currentImageData).fileName;

const createImageOperationsStore = () => {
	const _imageOperationsByFilename = writable<Record<string, Operations>>(
		persisted ? JSON.parse(persisted) : {}
	);
	// 👇 Sync with localstorage
	_imageOperationsByFilename.subscribe((value) => {
		isomorphicLocalStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
	});

	const retrieveOrInitialiseOperations = (fileName: string) => {
		const existingOperations = get(_imageOperationsByFilename)[fileName];
		if (!existingOperations) {
			_imageOperationsByFilename.update((imageOperations) => {
				imageOperations[fileName] = defaultOperations;
				return imageOperations;
			});
			return defaultOperations;
		}
		return existingOperations;
	};

	/**
	 * Gets the value of the operation, bound to the current file
	 */
	const getOperationValue = <Key extends keyof Operations>(key: Key): Operations[Key] => {
		const operations = get(_imageOperationsByFilename);
		return operations[getFileName()][key];
	};

	/**
	 * Sets the value of the operation, bound to the current file
	 */
	const setOperationValue = <Key extends keyof Operations>(key: Key, value: Operations[Key]) => {
		const fileName = getFileName();
		_imageOperationsByFilename.update((imageOperations) => {
			imageOperations[fileName] = {
				...imageOperations[fileName],
				[key]: value
			};
			return imageOperations;
		});
	};

	return {
		..._imageOperationsByFilename,
		retrieveOrInitialiseOperations,
		getOperationValue,
		setOperationValue
	};
};

export const imageOperationsByFilename = createImageOperationsStore();
