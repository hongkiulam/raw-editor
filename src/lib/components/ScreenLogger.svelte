<script lang="ts">
	import { onMount } from 'svelte';
	let el: HTMLDivElement;
	onMount(() => {
		const oldConsoleLog = console.log;
		console.log = function (...message) {
			if (el) {
				const p = document.createElement('p');
				p.textContent = message
					.filter((m) => typeof m === 'string' && !m.includes('color:'))
					.join(' ');
				el.appendChild(p);
				el.scrollTo({
					top: el.scrollHeight
				});
			}
			oldConsoleLog.apply(console, arguments);
		};
	});
</script>

<details>
	<summary>logs</summary>

	<div bind:this={el}></div>
</details>

<style>
	div {
		overflow: auto;
		width: 100%;
		height: 300px;
		font-size: 8px;
	}
</style>
