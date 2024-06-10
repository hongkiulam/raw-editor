import type { MyRawImage } from '$lib/raw-processor';
import { get, writable } from 'svelte/store';
import { useCanvas } from './canvas';
const currentRawImageState = writable<MyRawImage | undefined>();
const imageHasMutated = writable({});

export const useRawImage = () => {
	const { resetInteractions } = useCanvas();

	const renewRGBA = () => {
		imageHasMutated.set({});
	};

	const setRawImage = (rawImage: MyRawImage) => {
		currentRawImageState.set(rawImage);
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
		imageHasMutated: imageHasMutated,
		operations
	};
};
