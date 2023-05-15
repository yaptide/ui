/**
 * @type [RegExp, string][]
 */
const escapableSigns: [RegExp, string][] = [
	[/&/g, '&amp;'],
	[/</g, '&lt;'],
	[/>/g, '&gt;'],
	[/"/g, '&quot;'],
	[/'/g, '&#039;']
];

/**
 *
 * @param {string} html
 * @returns {string}
 */
export function escapeHTML(html: string) {
	return escapableSigns.reduce(
		(acc, [regex, replacement]) => acc.replace(regex, replacement),
		html
	);
}
