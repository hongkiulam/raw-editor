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
	let hasChanged = false;
	const originalValue = imageOperationsByFilename.getOperationValue(key) as Value;
	const value = writable(originalValue);

	const throttledOnChange = throttle(onChange, throttleTime);

	value.subscribe((value) => {
		if (!hasChanged && originalValue === value) return;
		// this ensures that we only call the onChange function when the value has changed
		throttledOnChange(value);
		hasChanged = true;
		imageOperationsByFilename.setOperationValue(key, value);
	});

	return value;
};
