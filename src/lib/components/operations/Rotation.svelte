<script>
	import { imageOperations } from '../../state/imageOperations';
	import Button from '../Button.svelte';
</script>

<Button
	onclick={() => {
		$imageOperations.rotation = ($imageOperations.rotation + 90) % 360;
	}}
>
	Rotate
</Button>
