import type { Action } from 'svelte/action';

export const doubleTap: Action<HTMLElement, () => void> = (node, callback) => {
	let lastClickTime = 0;
	const doubleTapTime = 300;

	const handler = () => {
		const currentTime = new Date().getTime();
		const tapLength = currentTime - lastClickTime;

		if (tapLength < doubleTapTime && tapLength > 0) {
			callback();
		}

		lastClickTime = currentTime;
	};
	node.addEventListener('click', handler);

	return {
		destroy() {
			node.removeEventListener('click', handler);
		}
	};
};
