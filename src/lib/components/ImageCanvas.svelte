<script lang="ts">
	import { useRawImage } from '$lib/state/currentRawImage';
	import type { MyRawImage } from 'raw-processor';

	// TODO: need better pipelines for when changes occur
	// and need to expose functions which can control the canvas i.e. (resetScale) for if we want to use a rotate tool
	// small changes only need to redraw the natural image source canvas
	// whereas bigger change need to redraw the other canvases too, maybe we just redraw everything always? (probably, just get it working)
	// need a way to declaratively redraw the canvas
	const { rawImage, rawImageRGBA } = useRawImage();

	$effect(() => {
		console.log($rawImage);
	});

	let canvas: HTMLCanvasElement | undefined;
	let canvasCtx = $derived(canvas?.getContext('2d'));
	let imageCanvas: HTMLCanvasElement | undefined;
	let imageCanvasCtx = $derived(imageCanvas?.getContext('2d'));

	$effect(() => {
		if (imageCanvas) {
			setCanvasSizeToActualSize(imageCanvas);
		}
	});

	$effect(() => {
		if (canvas) {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}
	});

	$effect(() => {
		if ($rawImage && $rawImageRGBA) {
			renderImageData();
		}
	});

	const createNaturalImageSource = (rawImage: MyRawImage) => {
		const canvas = document.createElement('canvas');
		// Set the image source to be the size as the raw image
		canvas.width = rawImage.width;
		canvas.height = rawImage.height;

		const ctx = canvas.getContext('2d');
		if (!ctx) {
			throw new Error('Could not get context');
		}
		const imageData = ctx.createImageData(rawImage.width, rawImage.height);
		// this is not using state atm, so beware of diverging data (shouldnt tho)
		imageData.data.set(rawImage.image_as_rgba8);
		ctx.putImageData(imageData, 0, 0);
		return canvas;
	};

	const setCanvasSizeToActualSize = (canvas: HTMLCanvasElement) => {
		const { width, height } = canvas.getBoundingClientRect();
		// The canvas size must be explicitly set like this for draws to work properly
		canvas.width = width;
		canvas.height = height;
	};

	const getGoodFitDimensions = (rawImage: MyRawImage, canvas: HTMLCanvasElement) => {
		const containerW = canvas.width;
		const containerH = canvas.height;
		const imageAspectRatio = rawImage.width / rawImage.height;

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

	const renderImageData = async () => {
		if (!($rawImage && imageCanvas && imageCanvasCtx && canvasCtx && canvas)) return;
		const imageSource = createNaturalImageSource($rawImage);

		// just in case canvas size has changed since last render (window resize?)
		setCanvasSizeToActualSize(imageCanvas);
		const goodFitDimensions = getGoodFitDimensions($rawImage, imageCanvas);
		imageCanvasCtx.reset();
		// render image into the image area, scaled to fit
		imageCanvasCtx.drawImage(
			imageSource,
			goodFitDimensions.x,
			goodFitDimensions.y,
			goodFitDimensions.width,
			goodFitDimensions.height
		);

		// render the scaled canvas into the overflow canvas, so that we can pan, zoom, across the whole viewport
		// since we already scaled and positioned with imageCanvas, we can just render to 0,0
		canvasCtx.reset();
		canvasCtx.drawImage(imageCanvas, 0, 0);
	};
</script>

<canvas bind:this={imageCanvas} class="image-canvas"></canvas>
<canvas bind:this={canvas} class="user-interacting-canvas"></canvas>

<style>
	.image-canvas {
		width: 100%;
		height: 100%;
		visibility: hidden;
	}
	.user-interacting-canvas {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		z-index: var(--z-canvas);
	}
</style>
