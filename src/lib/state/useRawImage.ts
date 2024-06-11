import { Edits, RawFile } from '$lib/raw-processor';
import { derived, get, writable } from 'svelte/store';
import { useCanvas } from './canvas';
import { imageEditsByFileName } from './imageEdits';

const currentRawImageState = writable<{
	fileName: string;
	rawFile?: RawFile;
	editedImageRGBA?: Uint8Array;
}>({ fileName: '' });
const imageHasMutated = writable({});

export const useRawImage = () => {
	const { resetInteractions } = useCanvas();
	const fileName = derived(currentRawImageState, (v) => v.fileName);
	const rawFile = derived(currentRawImageState, (v) => v.rawFile);
	const editedImageRGBA = derived(currentRawImageState, (v) => v.editedImageRGBA);
	const edits = derived(
		[fileName, imageEditsByFileName],
		([fileName, imageEditsByFileName]) => imageEditsByFileName[fileName]
	);

	const processEdits = async () => {
		const dI = get(rawFile);

		if (!dI) return;
		console.log('gettingedits', get(edits).exposure);

		const newRGBA = await dI.process_edits(get(edits));
		currentRawImageState.update((state) => {
			state.editedImageRGBA = newRGBA;
			return state;
		});
	};

	const setRawImage = (fileName: string, image: RawFile) => {
		currentRawImageState.update((state) => {
			state.fileName = fileName;
			state.rawFile = image;
			// TODO, process existing edits here
			state.editedImageRGBA = image.image_as_rgba8;
			return state;
		});

		// create a new edits object if it doesn't exist
		imageEditsByFileName.update((state) => {
			if (!state[fileName]) {
				state[fileName] = new Edits();
			}
			return state;
		});
	};

	const updateEdits = async <Key extends keyof Edits>(key: Key, value: Edits[Key]) => {
		const fN = get(fileName);
		if (!fN) return;
		imageEditsByFileName.update((state) => {
			state[fN][key] = value;
			return state;
		});
		console.log('update?');
		await processEdits();
	};

	const operations = {
		increaseExposure: (multiplier: number) => {
			const myRawImage = get(currentRawImageState);
			// myRawImage?.ops.increase_exposure(myRawImage, multiplier);

			// get(currentRawImageState)?.ops.increase_exposure();
		},
		rotate: () => {
			// get(currentRawImageState)?.rotate_image();
			resetInteractions();
		}
	};

	return {
		setRawImage,
		fileName,
		rawFile,
		editedImageRGBA,
		operations,
		updateEdits,
		edits,
		processEdits
	};
};
