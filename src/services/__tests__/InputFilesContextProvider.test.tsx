import { renderHook, waitFor } from '@testing-library/react';
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

beforeEach(() => {
	mockConverter.isConverterReady = true;
	mockConverter.detectSimulators.mockImplementation(async files => detect(files));
	mockConverter.requiredInputFiles.mockImplementation(async () => REQUIRED);
	mockOpenDialog.mockReset();
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
