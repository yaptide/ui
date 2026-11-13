import { inputFilesZipName } from '../saveInputFiles';

describe('inputFilesZipName', () => {
	test.each([
		['Mój projekt', 'Mój_projekt'],
		['  ', 'project'],
		[undefined, 'project'],
		['Proton / beam: 100 MeV!', 'Proton_beam_100_MeV'],
		['a-b_c', 'a-b_c']
	])('project title %p becomes %p', (title, projectPart) => {
		expect(inputFilesZipName(title, {}, undefined)).toMatch(
			new RegExp(`^${projectPart}_input_files_\\d{4}-\\d{2}-\\d{2}_\\d{4}\\.zip$`)
		);
	});
});
