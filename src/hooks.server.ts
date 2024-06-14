/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const response = await resolve(event);
	/**
  * Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
  */
	// TODO: these are not applied to the response for the worker scripts, so will need investigating
	response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
	return response;
}

export async function handleFetch({ request, fetch }) {
	const response = await fetch(request);
	response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
	return response;
}
