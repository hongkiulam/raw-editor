<script lang="ts">
	import { createSlider, melt, type CreateSliderProps } from '@melt-ui/svelte';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

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

<span use:melt={$root} class="root">
	<span class="value">{getSingleValueFromRange($meltValueStore)}</span>
	<span class="label">{label}</span>
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
	}

	.label {
		position: absolute;
		top: 0;
		left: 0;
		/* // todo, do proper tokenify */
		font-size: small;
		z-index: 1;
	}
	.value {
		position: absolute;
		top: 0;
		right: 0;
		/* // todo, do proper tokenify */
		font-size: small;
		z-index: 1;
	}

	.range-track {
		height: 100%;
		width: 100%;
		background-color: rgba(0, 0, 0, 0.4);
	}

	.range {
		height: 100%;
		background-color: rgba(255, 255, 255, 0.7);
	}

	.thumb {
		height: 100%;
		width: 2px;
		&:focus {
		}

		&.active {
			background-color: rgba(0, 0, 255, 0.7);
		}
	}
</style>
