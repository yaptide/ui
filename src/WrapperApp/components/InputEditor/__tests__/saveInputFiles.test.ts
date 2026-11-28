import { inputFilesZipName, saveInputFile } from '../saveInputFiles';

const mockEnqueueSnackbar = jest.fn();
const mockSaveString = jest.fn();

jest.mock('notistack', () => ({
	enqueueSnackbar: (...args: unknown[]) => mockEnqueueSnackbar(...args)
}));

jest.mock('../../../../util/File', () => ({
	save: jest.fn(),
	saveString: (...args: unknown[]) => mockSaveString(...args)
}));

beforeEach(() => jest.clearAllMocks());

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

describe('saveInputFile', () => {
	afterEach(() => {
		delete (window as { showSaveFilePicker?: unknown }).showSaveFilePicker;
	});

	const pick = (handle: Promise<unknown>) =>
		((window as { showSaveFilePicker?: unknown }).showSaveFilePicker = jest.fn(() => handle));

	test('reports a failed write instead of downloading the file again', async () => {
		const error = jest.spyOn(console, 'error').mockImplementation(() => {});
		pick(
			Promise.resolve({
				createWritable: () => Promise.reject(new DOMException('denied', 'NotAllowedError'))
			})
		);

		await saveInputFile('beam.dat', 'NSTAT 10 0');

		expect(mockEnqueueSnackbar).toHaveBeenCalledWith("Couldn't save beam.dat", {
			variant: 'error'
		});
		expect(mockSaveString).not.toHaveBeenCalled();
		error.mockRestore();
	});

	test('does nothing when the picker is cancelled', async () => {
		pick(Promise.reject(new DOMException('cancelled', 'AbortError')));

		await saveInputFile('beam.dat', 'NSTAT 10 0');

		expect(mockSaveString).not.toHaveBeenCalled();
		expect(mockEnqueueSnackbar).not.toHaveBeenCalled();
	});

	test('downloads the file when the picker is not available', async () => {
		await saveInputFile('beam.dat', 'NSTAT 10 0');

		expect(mockSaveString).toHaveBeenCalledWith('NSTAT 10 0', 'beam.dat');
	});
});
