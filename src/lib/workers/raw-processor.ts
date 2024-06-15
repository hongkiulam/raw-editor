import * as Comlink from 'comlink';
import init, * as raw_editor from '$lib/raw-processor';
import { get, writable } from 'svelte/store';

// self.onmessage = async function (e) {
// 	const { eventType, eventData, id } = e.data;

// 	switch (eventType) {
// 		case 'init':
// 			await init();
// 			self.postMessage({ eventType, id, eventData: 'callback' });
// 			break;
// 		case 'decode':
// 			console.log('decoding raw file');
// 			const rawFile = raw_editor.RawFile.decode(eventData);
// 			console.log(rawFile);
// 			self.postMessage({ eventType, id, eventData: rawFile });
// 			break;
// 	}
// };

// worker.ts
const currentRawFileInstance = writable<raw_editor.RawFile | undefined>(undefined);

const serialisedRawFile = (rawFile: raw_editor.RawFile) => {
	return {
		width: rawFile.width,
		height: rawFile.height,
		metadata: rawFile.metadata,
		image_as_rgba8: rawFile.image_as_rgba8
	};
};
export type SerialisedRawFile = ReturnType<typeof serialisedRawFile>;

const rawProcessorWorker = {
	init: async () => {
		await init();
	},
	decode: async (rawFile: Uint8Array) => {
		const decodedRawFile = raw_editor.RawFile.decode(rawFile);
		currentRawFileInstance.set(decodedRawFile);
		return serialisedRawFile(decodedRawFile);
	},
	subscribeToRawFile: (callback: (rgba: SerialisedRawFile) => void) => {
		currentRawFileInstance.subscribe((rawFile) => {
			if (rawFile) {
				callback(serialisedRawFile(rawFile));
			}
		});
	}
};

export type RawProcessorWorker = typeof rawProcessorWorker;
Comlink.expose(rawProcessorWorker);
