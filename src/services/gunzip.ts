/**
 * A gzip member decompressed with the browser's own DecompressionStream
 */
export async function gunzip(data: Uint8Array): Promise<Uint8Array> {
	const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'));

	return new Uint8Array(await new Response(stream).arrayBuffer());
}
