/**
 * @type [RegExp, string][]
 */
const escapableSigns = [
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
export function escapeHTML(html) {
	return escapableSigns.reduce(
		(acc, [regex, replacement]) => acc.replace(regex, replacement),
		html
	);
}
