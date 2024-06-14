import init, * as raw_editor from '$lib/raw-processor';

self.onmessage = async function (e) {
	const { eventType, eventData, id } = e.data;

	switch (eventType) {
		case 'init':
			await init();
			await raw_editor.initThreadPool(navigator.hardwareConcurrency);
			self.postMessage({ eventType, id, eventData: 'callback' });
			break;
		case 'decode':
			console.log('decoding raw file');
			const rawFile = raw_editor.RawFile.decode(eventData);
			console.log(rawFile);
			self.postMessage({ eventType, id, eventData: rawFile });
			break;
	}
};
