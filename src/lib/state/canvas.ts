import { derived, get, writable } from 'svelte/store';

interface CanvasState {
	lastX: number;
	lastY: number;
	isDragging: boolean;
	originX: number;
	originY: number;
	zoom: number;
	pinchDistance?: number;
}

const initialInteractionState: Omit<CanvasState, ''> = {
	lastX: 0,
	lastY: 0,
	isDragging: false,
	originX: 0,
	originY: 0,
	zoom: 1,
	pinchDistance: undefined
};

const canvasState = writable<CanvasState>({
	...initialInteractionState
});

export const useCanvas = () => {
	const readonlyCanvasState = derived(canvasState, (v) => v);

	const handleZoomUpdate = (
		zoomDirection: 'IN' | 'OUT',
		zoomOriginX: number,
		zoomOriginY: number
	) => {
		canvasState.update((state) => {
			const wheel = zoomDirection === 'IN' ? 1.1 : 0.9;

			const newZoom = state.zoom * wheel;

			state.originX = zoomOriginX - ((zoomOriginX - state.originX) * newZoom) / state.zoom;
			state.originY = zoomOriginY - ((zoomOriginY - state.originY) * newZoom) / state.zoom;
			state.zoom = newZoom;
			return state;
		});
	};

	const onWheel = (event: WheelEvent) => {
		handleZoomUpdate(event.deltaY < 0 ? 'IN' : 'OUT', event.offsetX, event.offsetY);
	};

	const onPanStart = (event: MouseEvent | Touch) => {
		canvasState.update((state) => {
			state.lastX = 'offsetX' in event ? event.offsetX : event.clientX;
			state.lastY = 'offsetY' in event ? event.offsetY : event.clientY;
			state.isDragging = true;
			return state;
		});
	};

	const onPan = (event: MouseEvent | Touch) => {
		const isDragging = get(canvasState).isDragging;
		if (!isDragging) {
			return;
		}
		canvasState.update((state) => {
			const eventX = 'offsetX' in event ? event.offsetX : event.clientX;
			const eventY = 'offsetY' in event ? event.offsetY : event.clientY;
			const dx = eventX - state.lastX;
			const dy = eventY - state.lastY;
			state.originX += dx;
			state.originY += dy;
			state.lastX = eventX;
			state.lastY = eventY;
			return state;
		});
	};

	const onPanEnd = () => {
		canvasState.update((state) => {
			state.isDragging = false;
			return state;
		});
	};

	const onTouchStart = (event: TouchEvent) => {
		if (event.touches.length === 1) {
			onPanStart(event.touches[0]);
		} else if (event.touches.length === 2) {
			// Stop dragging, and prevent dragging if we have two fingers on the screen
			canvasState.update((state) => {
				state.isDragging = false;
				return state;
			});
		}
	};

	const onTouchMove = (event: TouchEvent) => {
		if (event.touches.length === 1) {
			onPan(event.touches[0]);
		} else if (event.touches.length === 2) {
			const previousPinchDistance = get(canvasState).pinchDistance;
			const touch1 = event.touches[0];
			const touch2 = event.touches[1];
			const currentPinchDistance = Math.hypot(
				touch2.clientX - touch1.clientX,
				touch2.clientY - touch1.clientY
			);

			if (previousPinchDistance) {
				const centerX = (touch1.clientX + touch2.clientX) / 2;
				const centerY = (touch1.clientY + touch2.clientY) / 2;
				handleZoomUpdate(
					currentPinchDistance > previousPinchDistance ? 'IN' : 'OUT',
					centerX,
					centerY
				);
				// const wheel = currentPinchDistance > lastDist ? 1.1 : 0.9;
				// const newScale = scale * wheel;

				// originX = centerX - ((centerX - originX) * newScale) / scale;
				// originY = centerY - ((centerY - originY) * newScale) / scale;

				// scale = newScale;
			}
			canvasState.update((state) => {
				state.pinchDistance = currentPinchDistance;
				return state;
			});
		}
	};

	const onTouchEnd = (event: TouchEvent) => {
		onPanEnd();
		if (event.touches.length < 2) {
			// if we have less than two fingers on the screen, reset the pinch distance
			canvasState.update((state) => {
				state.pinchDistance = undefined;
				return state;
			});
		}
	};

	const resetInteractions = () => {
		canvasState.update((state) => ({ ...state, ...initialInteractionState }));
	};

	return {
		...readonlyCanvasState,
		resetInteractions,
		eventHandlers: {
			onMouseDown: onPanStart,
			onMouseMove: onPan,
			onMouseUp: onPanEnd,
			onTouchStart,
			onTouchMove,
			onTouchEnd,
			onWheel: onWheel
		}
	};
};
