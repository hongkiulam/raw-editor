import { derived, get, writable } from 'svelte/store';

interface CanvasState {
	isDragging: boolean;

	previousPanX: number;
	previousPanY: number;
	/** Distance from the offsetted image origin X */
	imageDistanceFromOffsetX: number;
	/** Distance from the offsetted image origin Y */
	imageDistanceFromOffsetY: number;
	/** Distance from the true origin (viewport), to the initial X position of the image */
	imageOffsetX?: number;
	/** Distance from the true origin (viewport), to the initial Y position of the image */
	imageOffsetY?: number;

	zoom: number;
	pinchDistance?: number;
}

const initialInteractionState: Omit<CanvasState, ''> = {
	isDragging: false,

	previousPanX: 0,
	previousPanY: 0,
	imageDistanceFromOffsetX: 0,
	imageDistanceFromOffsetY: 0,
	imageOffsetX: undefined,
	imageOffsetY: undefined,

	zoom: 1,
	pinchDistance: undefined
};

const createCanvasStore = () => {
	const canvasState = writable<CanvasState>({
		...initialInteractionState
	});

	const readonlyCanvasState = derived(canvasState, (v) => v);

	const handleZoomUpdate = (
		zoomDirection: 'IN' | 'OUT',
		/** x position for the zursor, origin for zoom */
		cursorOriginX: number,
		/** y position for the zursor, origin for zoom */
		cursorOriginY: number
	) => {
		canvasState.update((state) => {
			const zoomSensitivity = 0.01; // 0.01 works better for mac trackpad
			const wheel = zoomDirection === 'IN' ? 1 + zoomSensitivity : 1 - zoomSensitivity;

			const newZoom = state.zoom * wheel;

			// |root |offs |img  |c
			// |r----|o----|i----|c <- cursorOriginX (12px)
			// |r    |o----|i----|c <- cursorXCalibratedForImageOffset (8px)
			const cursorXCalibratedForImageOffset = cursorOriginX - state.imageOffsetX!; // we _should_ have this value, hence !
			const cursorYCalibratedForImageOffset = cursorOriginY - state.imageOffsetY!; // we _should_ have this value, hence !

			// So this is how far the cursor is away from the top left corner of the image
			// relative to the cursor, i.e. if the cursor is to the right of the image origin, these values will be negative
			// |r    |o----|i----|c <- cursorXCalibratedForImageOffset (8px)
			// |r    |o----|i    |c <- state.imageDistanceFromOffsetX (4px)
			// |r    |o    |i----|c <- imageDistToCursorX (-4px)
			const imageDistToCursorX = state.imageDistanceFromOffsetX - cursorXCalibratedForImageOffset;
			const imageDistToCursorY = state.imageDistanceFromOffsetY - cursorYCalibratedForImageOffset;

			const zoomChangeFactor = newZoom / state.zoom;

			// This is how far the cursor should be from the top left corner of the image after zooming
			// e.g. when the cursor is inside the image, and we zoom in, then the distance should increase (image expands)
			// |r----|o----|i----|c
			// |r    |o??|i------|c <- zoomedImageDistToCursorX (-6px)
			const zoomedImageDistToCursorX = imageDistToCursorX * zoomChangeFactor;
			const zoomedImageDistToCursorY = imageDistToCursorY * zoomChangeFactor;

			// Now that we have the zoomed distance that the origin of the image should be from the cursor position
			// we can add the zoom distance to the cursor position to get the new image origin coords
			// |r    |o--|i      |c <- state.imageDistanceFromOffsetX (2px)
			state.imageDistanceFromOffsetX = zoomedImageDistToCursorX + cursorXCalibratedForImageOffset;
			state.imageDistanceFromOffsetY = zoomedImageDistToCursorY + cursorYCalibratedForImageOffset;

			state.zoom = newZoom;
			return state;
		});
	};

	const onWheel = (event: WheelEvent) => {
		handleZoomUpdate(event.deltaY < 0 ? 'IN' : 'OUT', event.offsetX, event.offsetY);
	};

	const onPanStart = (event: MouseEvent | Touch) => {
		canvasState.update((state) => {
			state.previousPanX = 'offsetX' in event ? event.offsetX : event.clientX;
			state.previousPanY = 'offsetY' in event ? event.offsetY : event.clientY;
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
			const dx = eventX - state.previousPanX;
			const dy = eventY - state.previousPanY;
			state.imageDistanceFromOffsetX += dx;
			state.imageDistanceFromOffsetY += dy;
			state.previousPanX = eventX;
			state.previousPanY = eventY;
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

	/**
	 * Typically this will happen if the viewport changes
	 * @param x
	 * @param y
	 */
	const setImageOffsetOrigin = (x: number, y: number) => {
		const { imageOffsetX: imageOffsetOriginX, imageOffsetY: imageOffsetOriginY } = get(canvasState);
		console.log({ x, y });
		const imageOffsetOriginUnchanged = x === imageOffsetOriginX && y === imageOffsetOriginY;
		if (imageOffsetOriginUnchanged) return;

		canvasState.update((state) => {
			state.imageOffsetX = x;
			state.imageOffsetY = y;
			return state;
		});
	};
	// canvasState.update(state => {
	// 	console.table(get(canvasState))
	// 	const { imageOffsetOriginX, imageOffsetOriginY } = state
	// 	// do nothing if offset origin hasn't changed
	// 	const imageOffsetOriginUnchanged = x === imageOffsetOriginX && y === imageOffsetOriginY
	// 	const originHasntBeenSet = imageOffsetOriginX === undefined || imageOffsetOriginY === undefined;
	// 	if (imageOffsetOriginUnchanged || originHasntBeenSet) return
	// 	// get how much the offset has changed
	// 	// then we can apply that change onto image distance
	// 	const dx = x - state.imageOffsetOriginX;
	// 	const dy = y - state.imageOffsetOriginY;

	// 	state.imageDistanceFromOriginX = state.imageDistanceFromOriginX - dx;
	// 	state.imageDistanceFromOriginY = state.imageDistanceFromOriginY - dy;
	// 	return state
	// })

	return {
		...readonlyCanvasState,
		resetInteractions,
		setImageOffsetOrigin,
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

export const canvasState = createCanvasStore();
