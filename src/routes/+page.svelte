<input type="file" id="fileInput" accept=".raw,.nef,.cr2,.arw,.dng" />
<button id="button">increase exposure</button>
<canvas id="canvas"></canvas>

<style>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		display: grid;
		grid-template-rows: auto auto 1fr;
		height: 100vh;
		place-items: center;
		gap: 8px;
	}
</style>
