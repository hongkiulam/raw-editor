import * as Comlink from 'comlink';
import init, * as raw_editor from '$lib/raw-processor';

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

const rawProcessorWorker = {
	init: async () => {
		await init();
		return 'finished';
	},
	decode: async (rawFile: Uint8Array) => {
		const rawFileObj = raw_editor.RawFile.decode(rawFile);
		return rawFileObj;
	}
};

export type RawProcessorWorker = typeof rawProcessorWorker;
Comlink.expose(rawProcessorWorker);
