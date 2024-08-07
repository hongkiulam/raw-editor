<script lang="ts">
	import { createSlider, melt, type CreateSliderProps } from '@melt-ui/svelte';
	import { onMount } from 'svelte';
	import { get, writable } from 'svelte/store';
	import { doubleTap } from '../../../helpers/dblTapAction';

	interface Props {
		base: number;
		min: number;
		max: number;
		value: number;
		step: number;
		label: string;
	}
	let { base, min, max, value = $bindable(), step, label }: Props = $props();

	const SLIDER_MOVEMENT_TRANSITION_TIME = 300;
	// Out custom store to provide to the Melt UI Slider
	// ℹ️ Provide two values to activate the range Slider, while we are not using the range functionality,
	// it provides us the correct elements to style the slider in the way we want (highlighted mid section)
	let meltValueStore = writable([value]);

	// 👇 This sends the latest value back to the implementor, allowing stuff like bind:value
	onMount(() => {
		meltValueStore.subscribe(([newValue]) => {
			if (value !== newValue) {
				value = newValue;
			}
		});
	});
	// 👇 If changes are made to the value prop from outside of this component, sync it back to melt. e.g. Reset Adjustments
	$effect(() => {
		if (value !== get(meltValueStore)[0]) {
			requestSliderTransition();
			meltValueStore.set([value]);
		}
	});

	/** track if we are dragging, if so we should enable sticking. otherwise don't stick (arrow key usage) */
	let isDragging = false;
	let isStickingToBase = false;
	const maxStickDistance = 5 * step;

	const setDraggingOn = () => (isDragging = true);

	const setDraggingOff = () => (isDragging = false);

	const onValueChange: CreateSliderProps['onValueChange'] = ({ curr, next }) => {
		const nextValue = next[0];
		if (isStickingToBase) {
			const upperBound = base + maxStickDistance;
			const lowerBound = base - maxStickDistance;

			if (nextValue <= lowerBound || nextValue >= upperBound) {
				isStickingToBase = false;
				return next;
			} else {
				// We are still sticking to the base, so we should return the current value
				return curr;
			}
		}
		if (nextValue === base && isDragging) {
			isStickingToBase = true;
		}

		return next;
	};

	const getRangeHighlightStyle = () => {
		const value = $meltValueStore[0];
		const baseDistanceFromLeft = ((base - min) / (max - min)) * 100;
		const currentDistanceFromLeft = ((value - min) / (max - min)) * 100;

		let style = 'position:absolute;';
		if (currentDistanceFromLeft > baseDistanceFromLeft) {
			style += `left: ${baseDistanceFromLeft}%; right: ${100 - currentDistanceFromLeft}%;`;
		} else {
			style += `left: ${currentDistanceFromLeft}%; right: ${100 - baseDistanceFromLeft}%;`;
		}
		return style;
	};

	const {
		elements: { root, range, thumbs }
	} = createSlider({
		min: min,
		max: max,
		step: step,
		value: meltValueStore,
		onValueChange
	});

	let transitionSliderMovement = $state(false);
	const requestSliderTransition = () => {
		transitionSliderMovement = true;
		setTimeout(() => {
			transitionSliderMovement = false;
		}, SLIDER_MOVEMENT_TRANSITION_TIME); // animation time
	};
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
	use:melt={$root}
	class="root"
	style:--slider-movement-transition-duration={SLIDER_MOVEMENT_TRANSITION_TIME + 'ms'}
	class:transition-slider-movement={transitionSliderMovement}
	use:doubleTap={() => {
		requestSliderTransition();
		meltValueStore.set([base]);
	}}
	onpointerdown={setDraggingOn}
	onmousedown={setDraggingOn}
	onpointerup={setDraggingOff}
	onmouseup={setDraggingOff}
>
	<div class="field-info">
		<span>{label}</span>
		<span>{$meltValueStore[0]}</span>
	</div>
	<div class="ruler minor"></div>
	<div class="ruler major"></div>
	<span class="range-track">
		<!-- Override the range styling, so that we can have it grow from the base value -->
		<span use:melt={$range} class="range" style={getRangeHighlightStyle()}></span>
	</span>

	<span use:melt={$thumbs[0]} class="thumb"></span>
</span>

<style>
	.root {
		position: relative;
		display: flex;
		height: 20px;
		width: 200px;
		align-items: center;
		isolation: isolate;
		/* colour is ligher than the sidebar */
		background: hsl(var(--surface-4-hsl) / 30%);
		/* font size for all nested elements should be small */
		font-size: var(--font-size-0);
		color: var(--text-1);
		border-radius: var(--radius-1);
		overflow: hidden;
	}

	.field-info {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 100%;
		padding: var(--size-1);
		z-index: 1;
	}

	.ruler {
		--rule-width: 1px;
		position: absolute;
		top: 0;
		/* Shift to the right by 0.5px so that the 1px lines have their centre points exactly on the division lines */
		left: calc(var(--rule-width) / 2);
		/* make this 1px smaller so that we clip on the right hand side, otherwise it would stick out */
		width: calc(100% - var(--rule-width));
		height: 100%;

		/* some magic gradient, it renders a some spacing on the left, then a single rule on the right */
		/* This is all based on the css variables provided for spacing, width and height */
		/* Then we use a background repeat to repeat it along the enture width */
		background-image: linear-gradient(
			to right,
			transparent 0px,
			transparent calc(var(--rule-spacing) - var(--rule-width)),
			var(--rule-color) calc(var(--rule-spacing) - var(--rule-width)),
			var(--rule-color) var(--rule-spacing)
		);
		background-size: var(--rule-spacing) /* x */ var(--rule-height) /* y */;

		background-repeat: repeat-x;
		transition: opacity 0.3s ease;
		opacity: 0;
		pointer-events: none;
	}

	.root:hover .ruler {
		opacity: 1;
	}

	.ruler.minor {
		/* one line every 5 pixels for the 200px width, i.e. 40 lines */
		--rule-height: 4px;
		--rule-spacing: 5px;
		--rule-color: hsl(var(--surface-4-hsl) / 50%);
	}

	.ruler.major {
		--rule-height: 6px;
		--rule-spacing: 25px;
		--rule-color: hsl(var(--surface-4-hsl) / 100%);
	}

	.range-track {
		height: 100%;
		width: 100%;
	}

	.range {
		height: 100%;
		/* lighter colour */
		background-color: var(--surface-4);
		transition: background-color 0.3s ease;
	}

	.root:hover .range {
		background-color: hsl(var(--brand-hsl) / 50%);
	}

	.thumb {
		height: 100%;
		width: var(--border-size-2);
		transition: background-color 0.3s ease;
		/* by default, the thumb should be the same colour as the range, but also this provides a visual element when the thumb is in the middle */
		background-color: var(--surface-4);
	}
	.root.transition-slider-movement {
		.thumb,
		.range {
			transition: all var(--slider-movement-transition-duration) ease;
		}
	}

	.root:hover .thumb,
	.thumb:focus {
		background-color: var(--brand);
	}
</style>
