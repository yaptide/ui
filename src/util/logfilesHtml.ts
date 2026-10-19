const escapeHtml = (text: string) =>
	text.replace(
		/[&<>"]/g,
		char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] as string
	);

function section(name: string, value: unknown, level: number): string {
	const body =
		value !== null && typeof value === 'object'
			? Object.entries(value)
					.map(([key, inner]) => section(key, inner, level + 1))
					.join('')
			: `<pre>${escapeHtml(String(value))}</pre>`;

	return `<details><summary><h${level} style="display: inline;">${escapeHtml(name)}</h${level}></summary>${body}</details>`;
}

/**
 * The body of the page showing a simulation's logs: why it failed first, when the log says so,
 * then each log as a collapsible block, a log made of several files (e.g. the scripts of an HPC job) one block each.
 */
export function logfilesHtml(logfiles: Record<string, unknown>): string {
	const { message, ...rest } = logfiles;
	const reason =
		typeof message === 'string' ? `<p><strong>${escapeHtml(message)}</strong></p>` : '';
	const files = typeof message === 'string' ? rest : logfiles;

	return (
		reason +
		Object.entries(files)
			.map(([name, value]) => section(name, value, 2))
			.join('')
	);
}
