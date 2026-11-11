import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

import { SimulatorType } from '../../types/RequestTypes';
import {
	RequiredInputFiles,
	SimulatorDetection
} from '../../WrapperApp/components/InputEditor/simulatorDetection';
import { DETECTION_ERROR, InputFilesProvider, useInputFiles } from '../InputFilesContextProvider';

const REQUIRED: RequiredInputFiles = {
	[SimulatorType.SHIELDHIT]: ['beam.dat', 'geo.dat', 'mat.dat', 'detect.dat'],
	[SimulatorType.FLUKA]: ['fl_sim.inp'],
	[SimulatorType.GEANT4]: ['geometry.gdml', 'run.mac']
};

const detect = (files: Record<string, string>): SimulatorDetection => ({
	files: Object.fromEntries(
		Object.keys(files).map(name => [
			name,
			{
				simulator:
					(Object.keys(REQUIRED) as (keyof RequiredInputFiles)[]).find(simulator =>
						REQUIRED[simulator].includes(name)
					) ?? null,
				issues: []
			}
		])
	),
	simulators: Object.fromEntries(
		(Object.keys(REQUIRED) as (keyof RequiredInputFiles)[]).map(simulator => {
			const missing = REQUIRED[simulator].filter(name => !(name in files));

			return [
				simulator,
				missing.length > 0
					? { possible: false, reason: `Missing ${missing.join(', ')}`, missing }
					: { possible: true, missing: [] }
			];
		})
	) as SimulatorDetection['simulators']
});

const mockConverter = {
	isConverterReady: true,
	detectSimulators: jest.fn(async (files: Record<string, string>) => detect(files)),
	requiredInputFiles: jest.fn(async () => REQUIRED)
};

const mockEditor = {
	config: { getKey: () => 'Project' }
};

const mockOpenDialog = jest.fn();
const mockSaveInputFile = jest.fn();
const mockSaveInputFilesAsZip = jest.fn();

jest.mock('../../PythonConverter/PythonConverterService', () => ({
	usePythonConverter: () => mockConverter
}));

jest.mock('../StoreService', () => ({
	useStore: () => ({ yaptideEditor: mockEditor })
}));

jest.mock('../DialogService', () => ({
	useDialog: () => ({ open: mockOpenDialog })
}));

jest.mock('../../WrapperApp/components/InputEditor/saveInputFiles', () => ({
	inputFilesZipName: () => 'files.zip',
	saveInputFile: (...args: unknown[]) => mockSaveInputFile(...args),
	saveInputFilesAsZip: (...args: unknown[]) => mockSaveInputFilesAsZip(...args)
}));

const wrapper = ({ children }: { children: ReactNode }) => (
	<InputFilesProvider>{children}</InputFilesProvider>
);

const renderInputFiles = async () => {
	const view = renderHook(() => useInputFiles(), { wrapper });

	await waitFor(() => expect(view.result.current.requiredFiles).toBeDefined());

	return view;
};

const SH_FILES = { 'beam.dat': 'b', 'geo.dat': 'g', 'mat.dat': 'm', 'detect.dat': 'd' };

beforeEach(() => {
	mockConverter.isConverterReady = true;
	mockConverter.detectSimulators.mockImplementation(async files => detect(files));
	mockConverter.requiredInputFiles.mockImplementation(async () => REQUIRED);
	mockOpenDialog.mockReset();
	mockSaveInputFile.mockReset();
	mockSaveInputFilesAsZip.mockReset();
});

describe('switching the run simulator', () => {
	test('switches when the added files fit one simulator', async () => {
		const { result } = await renderInputFiles();

		await act(() => result.current.addFiles({ 'fl_sim.inp': 'x' }, 'add', 'Uploading files'));

		await waitFor(() => expect(result.current.runSimulator).toBe(SimulatorType.FLUKA));
	});

	test('switches once the converter is ready when files were added before', async () => {
		mockConverter.isConverterReady = false;
		const { result, rerender } = renderHook(() => useInputFiles(), { wrapper });

		await act(() => result.current.addFiles({ 'fl_sim.inp': 'x' }, 'add', 'Uploading files'));
		expect(result.current.runSimulator).toBe(SimulatorType.SHIELDHIT);

		mockConverter.isConverterReady = true;
		rerender();

		await waitFor(() => expect(result.current.runSimulator).toBe(SimulatorType.FLUKA));
	});

	test('an added file that no simulator requires keeps the chosen simulator', async () => {
		const { result } = await renderInputFiles();

		await act(() => result.current.addFiles({ 'fl_sim.inp': 'x' }, 'add', 'Uploading files'));
		await waitFor(() => expect(result.current.runSimulator).toBe(SimulatorType.FLUKA));

		act(() => result.current.setRunSimulator(SimulatorType.SHIELDHIT));
		await act(() => result.current.addFiles({ 'notes.txt': 'x' }, 'add', 'Uploading files'));
		await waitFor(() => expect(result.current.detection?.files['notes.txt']).toBeDefined());

		expect(result.current.runSimulator).toBe(SimulatorType.SHIELDHIT);
	});

	test('added files of two simulators keep the chosen simulator', async () => {
		const { result } = await renderInputFiles();

		act(() => result.current.setRunSimulator(SimulatorType.GEANT4));
		await act(() =>
			result.current.addFiles({ ...SH_FILES, 'fl_sim.inp': 'x' }, 'add', 'Uploading files')
		);
		await waitFor(() => expect(result.current.detection).toBeDefined());

		expect(result.current.runSimulator).toBe(SimulatorType.GEANT4);
	});

	test('renaming a selected copy to a required name switches', async () => {
		const { result } = await renderInputFiles();

		await act(() =>
			result.current.addFiles({ 'fl_sim (1).inp': 'x' }, 'add', 'Uploading files')
		);
		await act(() => result.current.renameFile('fl_sim (1).inp', 'fl_sim.inp'));

		await waitFor(() => expect(result.current.runSimulator).toBe(SimulatorType.FLUKA));
		expect(result.current.selectedFiles).toEqual(['fl_sim.inp']);
	});
});

describe('detection errors', () => {
	test('a failing detection is reported instead of checking forever', async () => {
		const error = jest.spyOn(console, 'error').mockImplementation(() => {});
		mockConverter.detectSimulators.mockRejectedValue(new Error('no detect_simulators'));

		const { result } = renderHook(() => useInputFiles(), { wrapper });

		await waitFor(() => expect(result.current.detectionError).toBe(DETECTION_ERROR));
		expect(result.current.detection).toBeUndefined();
		error.mockRestore();
	});
});

describe('confirming lost content', () => {
	test('asks one question at a time', async () => {
		const { result } = await renderInputFiles();

		await act(() => result.current.addFiles(SH_FILES, 'replace', 'Generating files'));

		let removedBeam: Promise<boolean> | undefined;
		let removedGeo: Promise<boolean> | undefined;

		await act(async () => {
			removedBeam = result.current.removeFile('beam.dat');
			removedGeo = result.current.removeFile('geo.dat');
		});

		expect(mockOpenDialog).toHaveBeenCalledTimes(1);
		expect(mockOpenDialog.mock.calls[0][0].fileNames).toEqual(['beam.dat']);

		await act(async () => mockOpenDialog.mock.calls[0][0].onCancel());
		await expect(removedBeam).resolves.toBe(false);

		await waitFor(() => expect(mockOpenDialog).toHaveBeenCalledTimes(2));
		expect(mockOpenDialog.mock.calls[1][0].fileNames).toEqual(['geo.dat']);

		await act(async () => mockOpenDialog.mock.calls[1][0].onOverwrite(true));
		await expect(removedGeo).resolves.toBe(true);

		expect(mockSaveInputFile).toHaveBeenCalledWith('geo.dat', 'g');
		expect(mockSaveInputFilesAsZip).not.toHaveBeenCalled();
		expect(Object.keys(result.current.inputFiles)).toEqual([
			'beam.dat',
			'mat.dat',
			'detect.dat'
		]);
	});

	test('downloads several lost files as one zip', async () => {
		const { result } = await renderInputFiles();

		await act(() => result.current.addFiles(SH_FILES, 'replace', 'Generating files'));

		let added: Promise<boolean> | undefined;

		await act(async () => {
			added = result.current.addFiles(
				{ 'beam.dat': 'new', 'geo.dat': 'new' },
				'replace',
				'Generating files'
			);
		});
		await act(async () => mockOpenDialog.mock.calls[0][0].onOverwrite(true));
		await expect(added).resolves.toBe(true);

		expect(mockSaveInputFilesAsZip).toHaveBeenCalledWith(
			{ 'beam.dat': 'b', 'geo.dat': 'g' },
			'files.zip'
		);
		expect(result.current.selectedFiles).toEqual(['beam.dat', 'geo.dat']);
	});

	test('empty files are replaced without asking', async () => {
		const { result } = await renderInputFiles();

		await act(() =>
			result.current.addFiles({ 'fl_sim.inp': '  ' }, 'replace', 'Creating empty files')
		);
		await act(() => result.current.addFiles({ 'fl_sim.inp': 'x' }, 'add', 'Uploading files'));

		expect(mockOpenDialog).not.toHaveBeenCalled();
		expect(result.current.inputFiles).toEqual({ 'fl_sim.inp': 'x' });
	});
});
