import { throttle } from 'lodash-es';
import { imageOperationsByFilename, type Operations } from './imageOperations';
import { writable } from 'svelte/store';

export const createSyncedOperationControlState = <
	Key extends keyof Operations,
	Value extends Operations[Key]
>(
	key: Key,
	onChange: (value: Value) => void,
	throttleTime = 500
) => {
	let value = writable(imageOperationsByFilename.getOperationValue(key) as Value);

	const throttledOnChange = throttle(onChange, throttleTime);

	value.subscribe((value) => {
		throttledOnChange(value);
		imageOperationsByFilename.setOperationValue(key, value);
	});

	return value;
};
