const escapeHtml = (text: string) =>
	text.replace(
		/[&<>"]/g,
		char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] as string
	);

// keys under which the backend says why a simulation failed
const reasonKeys = ['message', 'error'];

function section(name: string, value: unknown, depth: number): string {
	const level = Math.min(depth, 6);
	const body =
		value !== null && typeof value === 'object'
			? Object.entries(value)
					.map(([key, inner]) => section(key, inner, depth + 1))
					.join('')
			: `<pre>${escapeHtml(String(value))}</pre>`;

	return `<details><summary><h${level} style="display: inline;">${escapeHtml(name)}</h${level}></summary>${body}</details>`;
}

/**
 * The body of the page showing a simulation's logs: why it failed first, when the log says so,
 * then each log as a collapsible block, a log made of several files (e.g. the scripts of an HPC job) one block each.
 */
export function logfilesHtml(logfiles: Record<string, unknown>): string {
	const isReason = ([name, value]: [string, unknown]) =>
		reasonKeys.includes(name) && typeof value === 'string';
	const entries = Object.entries(logfiles);

	return (
		entries
			.filter(isReason)
			.map(([, reason]) => `<p><strong>${escapeHtml(reason as string)}</strong></p>`)
			.join('') +
		entries
			.filter(entry => !isReason(entry))
			.map(([name, value]) => section(name, value, 2))
			.join('')
	);
}
