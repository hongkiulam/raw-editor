import type { MyRawImage } from '$lib/raw-processor';
import { derived, get, writable } from 'svelte/store';
import { useCanvas } from './canvas';
const currentRawImageState = writable<MyRawImage | undefined>();
const currentRawImageRGBAState = writable<Uint8Array | undefined>();

export const useRawImage = () => {
	const { resetInteractions } = useCanvas();
	const readonlyCurrentRawImageState = derived(currentRawImageState, (v) => v);
	const readonlyCurrentRawImageRGBAState = derived(currentRawImageRGBAState, (v) => v);

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
			resetInteractions();
			renewRGBA();
		}
	};

	return {
		setRawImage,
		rawImage: currentRawImageState,
		rawImageRGBA: readonlyCurrentRawImageRGBAState,
		operations
	};
};
