<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import * as Comlink from 'comlink';
	import { prettyEventDesc, type DecodeEventName } from '../helpers/decodeEvents';
	import { currentImageData } from '../state/currentImageData';
	import Button from './Button.svelte';
	import { rawProcessorWorker } from '../workers';

	let loading = $state(false);
	let inputElement: HTMLInputElement | null = $state(null);

	let decodedEvents: DecodeEventName[] = $state([]);
	const prettyEventDescAsArray = Object.entries(prettyEventDesc) as [DecodeEventName, string][];
	let fileName = $state('');

	onMount(() => {
		const listener = Comlink.proxy((newEvent: DecodeEventName) => {
			decodedEvents.push(newEvent);
		});
		rawProcessorWorker.subscribeToDecodeProgress(listener);
	});
</script>

<div>
	{#if !loading}
		<label>
			<Button
				disabled={loading}
				onclick={() => {
					inputElement?.click();
				}}
			>
				Upload an image {loading ? '...' : ''}
			</Button>
			<input
				bind:this={inputElement}
				type="file"
				accept=".raw,.nef,.cr2,.arw,.dng,.raf"
				onchange={async (e) => {
					const file = e.currentTarget?.files?.[0];
					if (!file) return;
					fileName = file.name;
					const arrayBuffer = await file.arrayBuffer();
					const uint8Array = new Uint8Array(arrayBuffer);
					loading = true;
					try {
						await currentImageData.setNewFile(fileName, uint8Array);
						await goto('/edit');
					} catch (e) {
						console.log(e);
					} finally {
						loading = false;
					}
				}}
			/>
		</label>
	{:else}
		<div class="file-data translucent-glass">{fileName}</div>
		<ul class="events-list">
			{#each prettyEventDescAsArray as [decodeEvent, decodeEventLabel], index}
				{@const isCurrentDecodingEvent = decodedEvents.length === index + 1}
				{@const isEventCompleted = decodedEvents.includes(decodeEvent)}
				<li class:active={isCurrentDecodingEvent}>
					{#if isEventCompleted && !isCurrentDecodingEvent}
						<div class="icon checkmark">✓</div>
					{:else if isCurrentDecodingEvent}
						<div class="icon spinner"></div>
					{:else}
						<!-- empty icon -->
						<div class="icon"></div>
					{/if}
					<span>
						{decodeEventLabel}
					</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	label {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	input {
		height: 0;
		width: 0;
		padding: 0;
		visibility: hidden;
	}

	.file-data {
		padding: var(--size-3);
		border: var(--border-size-1) solid var(--text-2);
		margin-bottom: var(--size-3);
		border-radius: var(--radius-2);
		font-size: var(--font-size-0);
	}

	.events-list {
		padding: var(--size-2);
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		list-style: none;
		font-size: var(--font-size-0);
		width: max-content;
		margin: 0 auto;
	}

	.events-list li {
		opacity: 0.5;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		gap: var(--size-3);
	}

	.icon {
		width: 1rem;
		height: 1rem;
		display: grid;
		place-items: center;
	}

	.spinner {
		border: var(--border-size-2) solid var(--brand);
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	li.active {
		opacity: 1;
	}
</style>
