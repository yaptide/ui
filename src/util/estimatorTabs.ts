import { PartialPage } from '../services/usePartialResultsWatch';

/** The tab names, and after them the estimators the server announces maps of that are not among them yet */
export function withAnnouncedMaps(
	names: string[] | undefined,
	maps: PartialPage[] | undefined
): string[] | undefined {
	const extra = Array.from(new Set((maps ?? []).map(page => page.estimator))).filter(
		name => name && !names?.includes(name)
	);

	return extra.length ? [...(names ?? []), ...extra] : names;
}

/** The names in the order of the editor's outputs; those not among them after, as they were */
export function inEditorOrder(
	names: string[] | undefined,
	editorNames: string[] | undefined
): string[] | undefined {
	if (!names || !editorNames?.length) return names;

	const place = (name: string) => {
		const index = editorNames.indexOf(name);

		return index < 0 ? editorNames.length : index;
	};

	return names
		.map((name, index) => ({ name, index }))
		.sort((a, b) => place(a.name) - place(b.name) || a.index - b.index)
		.map(({ name }) => name);
}
