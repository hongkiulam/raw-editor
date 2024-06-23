<script lang="ts">
	import { createSlider, melt, type CreateSliderProps } from '@melt-ui/svelte';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { doubleTap } from '../../../helpers/dblTapAction';

	export let base: number;
	export let min: number;
	export let max: number;
	export let value: number;
	export let step = 0.01;
	export let label: string;

	/** ℹ️ This function converts the range value to a single value
	 * e.g. if the range is [base, value], it will return value
	 * if the range is [value, base], it will return value
	 * if the range is [base, base], it will return base
	 */
	const getSingleValueFromRange = (value: number[]) => {
		const withBaseRemoved = value.filter((v) => v !== base);
		return withBaseRemoved[0] ?? base;
	};

	/** Converts a single value into a range, that is appropriate for the slider
	 * e.g. if the value is greater than the base, the range will be [base, value]
	 * if the value is less than the base, the range will be [value, base]
	 */
	const getRangeFromSingleValue = (value: number) => {
		const range = [base, base];
		if (value > base) {
			range[1] = value;
		} else {
			range[0] = value;
		}
		return range;
	};

	// Out custom store to provide to the Melt UI Slider
	// ℹ️ Provide two values to activate the range Slider, while we are not using the range functionality,
	// it provides us the correct elements to style the slider in the way we want (highlighted mid section)
	let meltValueStore = writable(getRangeFromSingleValue(value));

	// 👇 This sends the latest value back to the implementor, allowing stuff like bind:value
	onMount(() => {
		meltValueStore.subscribe((v) => {
			value = getSingleValueFromRange(v);
		});
	});

	let isStickingToBase = false;
	const maxStickDistance = 5 * step;

	// This ensures that whenever the range changes, we eagerly accept the changes value, and set the opposing value to the base
	// e.g. The current range is [-0.5,0], assuming 0 is the base value
	// The new range is [-1,0], the first value changed, so the last value is set to zero (in this case its zero anyway)
	// The new range is [-0.5, 0.5], the second value changed, so the first value is set to zero -> [0, 0.5]
	const ensureBaseOnChange = (current: number[], next: number[]) => {
		// find which index changed
		const changedIndex = next.findIndex((v, i) => v !== current[i]);
		if (changedIndex === -1) return next;
		const newValues = [...next];
		// set the other index to the base
		newValues[1 - changedIndex] = base;
		return newValues;
	};

	// known bug where the mouse movement registers value changes when stuck on 0 for very small movements. this causes the final position which it reaches 0.05 to be actually 0.02
	// 👆 but too small to matter
	const onValueChange: CreateSliderProps['onValueChange'] = ({ curr, next }) => {
		const nextWithBase = ensureBaseOnChange(curr, next);
		const nextValue = getSingleValueFromRange(nextWithBase);

		if (isStickingToBase) {
			const upperBound = base + maxStickDistance;
			const lowerBound = base - maxStickDistance;

			if (nextValue <= lowerBound || nextValue >= upperBound) {
				isStickingToBase = false;
				return nextWithBase;
			} else {
				// We are still sticking to the base, so we should return the current value
				return curr;
			}
		}

		if (nextValue === base) {
			isStickingToBase = true;
		}

		return nextWithBase;
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

	$: activeThumb = getSingleValueFromRange($meltValueStore) > base ? 'higher' : 'lower';
</script>

<span
	use:melt={$root}
	class="root"
	use:doubleTap={() => {
		meltValueStore.set(getRangeFromSingleValue(0));
	}}
>
	<div class="field-info">
		<span>{label}</span>
		<span>{getSingleValueFromRange($meltValueStore)}</span>
	</div>
	<div class="ruler minor"></div>
	<div class="ruler major"></div>
	<span class="range-track">
		<span use:melt={$range} class="range"></span>
	</span>

	<span use:melt={$thumbs[0]} class="thumb lower" class:active={activeThumb === 'lower'}></span>
	<span use:melt={$thumbs[1]} class="thumb higher" class:active={activeThumb === 'higher'}></span>
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
		background: hsl(var(--surface-4-hsl) / 50%);
		/* font size for all nested elements should be small */
		font-size: var(--font-size-0);
		color: var(--text-1);
		border-radius: var(--radius-1);
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
		--rule-spacing: 40px;
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
	}
	/* by default, the thumb should be the same colour as the range, but also this provides a visual element when the thumb is in the middle */
	.thumb.active {
		background-color: var(--surface-4);
	}

	.root:hover .thumb.active,
	.thumb:focus {
		background-color: var(--brand);
	}
</style>
