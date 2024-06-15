// let RawProcessorWorker: Worker;
// let idPromises = new Map();

// if (typeof window !== 'undefined') {
// 	RawProcessorWorker = new Worker(new URL('./raw-processor.ts', import.meta.url), {
// 		type: 'module'
// 	});

// 	RawProcessorWorker.onmessage = function (e) {
// 		const { eventType, eventData, id } = e.data;
// 		if (id) {
// 			const { resolve, reject } = idPromises.get(id);
// 			if (eventType === 'error') {
// 				reject(eventData);
// 			} else {
// 				resolve(eventData);
// 			}
// 			idPromises.delete(id);
// 		}
// 	};
// }

// export const rawProcessorCall = (eventType: string, eventData: any) => {
// 	return new Promise((resolve, reject) => {
// 		const id = Math.random().toString(36).substring(7);
// 		idPromises.set(id, { resolve, reject });
// 		RawProcessorWorker.postMessage({ eventType, eventData, id });
// 	});
// };

import * as Comlink from 'comlink';
import type { RawProcessorWorker } from './raw-processor';

const rawProcessorWorkerStub = {
	init: async () => '',
	decode: async () => null
} as unknown as RawProcessorWorker;

export const rawProcessorWorker =
	typeof window === 'undefined'
		? rawProcessorWorkerStub
		: Comlink.wrap<RawProcessorWorker>(
				new Worker(new URL('./raw-processor.ts', import.meta.url), { type: 'module' })
			);
