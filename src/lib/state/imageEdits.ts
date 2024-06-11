import { Edits } from '$lib/raw-processor/raw_processor';
import { writable } from 'svelte/store';

export const imageEditsByFileName = writable<Record<string, Edits>>({});
