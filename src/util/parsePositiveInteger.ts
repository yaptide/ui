export function parsePositiveInteger(text: string): number {
	const value = Number(text);

	return text.trim() !== '' && Number.isSafeInteger(value) && value >= 1 ? value : NaN;
}
