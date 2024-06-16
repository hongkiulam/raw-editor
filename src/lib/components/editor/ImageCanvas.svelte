<script lang="ts">
	import { canvasState } from '../../state/canvas';
	import { currentImageData } from '../../state/currentImageData';
	import type { SerialisedImageData } from '../../workers/raw-processor';

	// todo, disable system viewport zooming for the canvas area
	// todo: retain image quality by handling zoom and position in the canvas using the drawImage arguments (on the scaled canvas)
	const canvasLogger = (...args: any[]) => console.log('%c CANVAS', 'color: yellow', ...args);

	let imageBoundingArea = $state({ width: 0, height: 0 });

	// TODO: Improve performing, by reducing amount of copies, by drawing to the image source canvas direct from rust, then emit and event to redraw other canvas.
	let imageSource: HTMLCanvasElement | undefined = $state();
	const drawImageSource = (data: SerialisedImageData, editedImageRGBA: Uint8Array) => {
		canvasLogger('Redrawing image source');
		const canvas = document.createElement('canvas');
		// Set the image source to be the size as the raw image
		canvas.width = data.width;
		canvas.height = data.height;

		const ctx = canvas.getContext('2d');
		if (!ctx) {
			throw new Error('Could not get context');
		}
		const imageData = ctx.createImageData(data.width, data.height);
		// this is not using state atm, so beware of diverging data (shouldnt tho)
		imageData.data.set(editedImageRGBA);
		ctx.reset();
		ctx.putImageData(imageData, 0, 0);
		imageSource = canvas;
	};

	$effect(() => {
		// Any time the raw image changes (the file has changed), or the image mutates (same file, but operated on)
		if ($currentImageData.image) {
			return drawImageSource($currentImageData.image, $currentImageData.image.image_as_rgba8);
		}
	});

	let scaledImageSource: HTMLCanvasElement | undefined = $state();
	$effect(() => {
		if (imageSource) {
			canvasLogger('Redrawing scaled image source');
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				throw new Error('Could not get context');
			}
			// fit this canvas to the bounding area
			canvas.width = imageBoundingArea.width;
			canvas.height = imageBoundingArea.height;
			const goodFitDimensions = getGoodFitDimensions(imageSource, canvas);
			ctx.reset();
			ctx.drawImage(
				imageSource,
				goodFitDimensions.x,
				goodFitDimensions.y,
				goodFitDimensions.width,
				goodFitDimensions.height
			);
			scaledImageSource = canvas;
		}
	});

	let interactionCanvas: HTMLCanvasElement | undefined;
	$effect(() => {
		if (scaledImageSource && interactionCanvas) {
			canvasLogger('Redrawing interaction canvas');
			const ctx = interactionCanvas.getContext('2d');
			if (!ctx) {
				throw new Error('Could not get context');
			}
			interactionCanvas.width = window.innerWidth;
			interactionCanvas.height = window.innerHeight;
			ctx.reset();
			// render the scaled canvas into the overflow canvas, so that we can pan, zoom, across the whole viewport
			// since we already scaled and positioned with imageCanvas, we can just render to 0,0
			ctx.translate($canvasState.originX, $canvasState.originY);
			ctx.scale($canvasState.zoom, $canvasState.zoom);
			ctx.drawImage(scaledImageSource, 0, 0);
		}
	});

	const getGoodFitDimensions = <Dimensions extends { width: number; height: number }>(
		imageDimensions: Dimensions,
		canvasDimensions: Dimensions
	) => {
		const containerW = canvasDimensions.width;
		const containerH = canvasDimensions.height;
		const imageAspectRatio = imageDimensions.width / imageDimensions.height;

		const containerAspectRatio = containerW / containerH;

		// x and y positions to centre the image
		let outputWidth, outputHeight, x, y;

		if (imageAspectRatio > containerAspectRatio) {
			// width fills container
			outputWidth = containerW;
			outputHeight = containerW / imageAspectRatio;
			x = 0;
			y = (containerH - outputHeight) / 2;
		} else {
			// height fills container
			outputWidth = containerH * imageAspectRatio;
			outputHeight = containerH;
			x = (containerW - outputWidth) / 2;
			y = 0;
		}

		return { width: outputWidth, height: outputHeight, x, y };
	};
</script>

<!-- 👇 This div will fill the parent container, to provide us with the correct space to initially scale the image into -->
<!-- This also updates when the parent container changes size, no resize handler needed 🎉 -->
<div
	class="image-bounding-area"
	bind:clientWidth={imageBoundingArea.width}
	bind:clientHeight={imageBoundingArea.height}
></div>
<canvas
	bind:this={interactionCanvas}
	class="interaction-canvas"
	onmousedown={canvasState.eventHandlers.onMouseDown}
	onmouseup={canvasState.eventHandlers.onMouseUp}
	onmousemove={canvasState.eventHandlers.onMouseMove}
	ontouchstart={canvasState.eventHandlers.onTouchStart}
	ontouchmove={canvasState.eventHandlers.onTouchMove}
	ontouchend={canvasState.eventHandlers.onTouchEnd}
	onwheel={canvasState.eventHandlers.onWheel}
></canvas>

<style>
	.image-bounding-area {
		width: 100%;
		height: 100%;
	}
	.interaction-canvas {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		z-index: var(--z-canvas);
	}
</style>