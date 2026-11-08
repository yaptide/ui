import { PartialPage } from '../services/usePartialResultsWatch';
import { inEditorOrder, withAnnouncedMaps } from './estimatorTabs';

const map = (estimator: string, pageNumber = 0): PartialPage => ({
	estimator,
	file: `${estimator}.bdo`,
	pageNumber,
	name: 'Dose',
	dimensions: 2,
	requestedAt: null,
	mergedAt: null,
	primaries: null
});

test('an estimator of maps only gets a tab while the simulation runs, once', () => {
	const names = ['entrance', 'peak', 'z_profile'];

	expect(withAnnouncedMaps(names, [map('yz_profile'), map('yz_profile', 1)])).toEqual([
		'entrance',
		'peak',
		'z_profile',
		'yz_profile'
	]);
	expect(withAnnouncedMaps(names, [map('z_profile')])).toBe(names);
	expect(withAnnouncedMaps(names, undefined)).toBe(names);
	expect(withAnnouncedMaps(undefined, [map('yz_profile')])).toEqual(['yz_profile']);
});

test("the tabs follow the editor's outputs, whatever order the server lists them in", () => {
	const editor = ['z_profile', 'yz_profile', 'entrance', 'peak'];

	expect(inEditorOrder(['entrance', 'peak', 'z_profile', 'yz_profile'], editor)).toEqual(editor);
	expect(inEditorOrder(['other', 'peak', 'z_profile'], editor)).toEqual([
		'z_profile',
		'peak',
		'other'
	]);
	expect(inEditorOrder(['b', 'a'], undefined)).toEqual(['b', 'a']);
});
