const MAX_LENGTH = 300;
const VALUE_ERROR_PREFIX = /^(?:\w+\.)*ValueError:\s*/;

export function converterErrorMessage(error: unknown): string | undefined {
	const message =
		error instanceof Error ? error.message : typeof error === 'string' ? error : undefined;

	const lastLine = message
		?.split('\n')
		.map(line => line.trim())
		.filter(Boolean)
		.at(-1);

	if (!lastLine) return undefined;

	const text = lastLine.replace(VALUE_ERROR_PREFIX, '');

	return text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH)}…` : text;
}
