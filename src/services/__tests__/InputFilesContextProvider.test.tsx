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

jest.mock('../../PythonConverter/PythonConverterService', () => ({
	usePythonConverter: () => mockConverter
}));

jest.mock('../StoreService', () => ({
	useStore: () => ({ yaptideEditor: mockEditor })
}));

jest.mock('../DialogService', () => ({
	useDialog: () => ({ open: mockOpenDialog })
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
