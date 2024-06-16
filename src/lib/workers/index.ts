import * as Comlink from 'comlink';
import type { RawProcessorWorker } from './raw-processor';

const rawProcessorWorkerStub = {
	init: async () => '',
	decode: async () => null,
	subscribeToLatestImageData: async () => undefined
} as unknown as RawProcessorWorker;

export const rawProcessorWorker: RawProcessorWorker =
	typeof window === 'undefined'
		? rawProcessorWorkerStub
		: Comlink.wrap<RawProcessorWorker>(
				new Worker(new URL('./raw-processor.ts', import.meta.url), { type: 'module' })
			);
