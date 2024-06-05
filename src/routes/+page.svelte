<aside>
	<input type="file" id="fileInput" accept=".raw,.nef,.cr2,.arw,.dng" />
	<button id="button">increase exposure</button>
</aside>
<main>
	<canvas id="canvas"></canvas>
</main>

<style>
	aside {
		position: absolute;
		top: 0;
		right: 0;
		width: 224px;
		height: 100%;
		border-left: 1px solid rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(50px);
		background-color: rgba(var(--bg-rgb), 0.1);
	}
	main {
		display: grid;
		place-items: center;
		padding-right: 224px;
		width: 100%;
		height: 100%;
	}

	canvas {
		/* width: 100%;
		height: 100%;
		object-fit: contain; */
	}
	input {
		width: 100%;
	}
</style>
