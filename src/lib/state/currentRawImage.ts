import type { MyRawImage } from 'raw-processor';
import { derived, get, writable } from 'svelte/store';
const currentRawImageState = writable<MyRawImage | undefined>();
const currentRawImageRGBAState = writable<Uint8Array | undefined>();

const renewRGBA = () => {
	const currentRawImage = get(currentRawImageState);
	if (currentRawImage) {
		currentRawImageRGBAState.set(currentRawImage.image_as_rgba8);
	}
};

const setRawImage = (rawImage: MyRawImage) => {
	currentRawImageState.set(rawImage);
	currentRawImageRGBAState.set(rawImage.image_as_rgba8);
};

const operations = {
	increaseExposure: () => {
		get(currentRawImageState)?.increase_exposure();
		renewRGBA();
	},
	rotate: () => {
		get(currentRawImageState)?.rotate_image();
		renewRGBA();
	}
};

export const useRawImage = () => {
	const readonlyCurrentRawImageState = derived(currentRawImageState, (v) => v);
	const readonlyCurrentRawImageRGBAState = derived(currentRawImageRGBAState, (v) => v);

	return {
		setRawImage,
		rawImage: currentRawImageState,
		rawImageRGBA: readonlyCurrentRawImageRGBAState,
		operations
	};
};
