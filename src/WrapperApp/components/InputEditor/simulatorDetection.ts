import { SimulatorNames, SimulatorType } from '../../../types/RequestTypes';

export type InputFiles = Record<string, string>;

export type RunnableSimulator =
	| SimulatorType.SHIELDHIT
	| SimulatorType.FLUKA
	| SimulatorType.GEANT4;

export const RUNNABLE_SIMULATORS: RunnableSimulator[] = [
	SimulatorType.SHIELDHIT,
	SimulatorType.FLUKA,
	SimulatorType.GEANT4
];

export type RequiredInputFiles = Record<RunnableSimulator, string[]>;

export type FileIssue = {
	severity: 'warning';
	code: 'copy_suffix';
	message: string;
	suggestedName: string;
};

export type FileDetection = {
	simulator: RunnableSimulator | null;
	issues: FileIssue[];
};

export type SimulatorAvailability = {
	possible: boolean;
	reason?: string;
	missing: string[];
};

export type SimulatorDetection = {
	files: Record<string, FileDetection>;
	simulators: Record<RunnableSimulator, SimulatorAvailability>;
};

type ConverterFileIssue = Omit<FileIssue, 'suggestedName'> & { suggested_name: string };

type ConverterDetection = {
	files: Record<string, { simulator: RunnableSimulator | null; issues: ConverterFileIssue[] }>;
	simulators: Record<RunnableSimulator, SimulatorAvailability>;
};

export function fromConverterDetection(raw: unknown): SimulatorDetection {
	const { files, simulators } = raw as ConverterDetection;

	return {
		files: Object.fromEntries(
			Object.entries(files).map(([name, file]) => [
				name,
				{
					simulator: file.simulator,
					issues: file.issues.map(({ suggested_name, ...issue }) => ({
						...issue,
						suggestedName: suggested_name
					}))
				}
			])
		),
		simulators
	};
}

export const simulatorName = (simulator: RunnableSimulator) =>
	SimulatorNames.get(simulator) ?? simulator;

export const emptyFiles = (names: string[]): InputFiles =>
	Object.fromEntries(names.map(name => [name, '']));

export function sortInputFileNames(
	names: string[],
	detection: SimulatorDetection | undefined,
	requiredFiles: RequiredInputFiles | undefined
): string[] {
	const rank = (name: string) => {
		const simulator = detection?.files[name]?.simulator ?? null;

		return simulator === null || !requiredFiles
			? [RUNNABLE_SIMULATORS.length, 0]
			: [RUNNABLE_SIMULATORS.indexOf(simulator), requiredFiles[simulator].indexOf(name)];
	};

	return [...names].sort((a, b) => {
		const [simulatorA, requiredA] = rank(a);
		const [simulatorB, requiredB] = rank(b);

		return simulatorA - simulatorB || requiredA - requiredB || a.localeCompare(b);
	});
}

export type FileHint = {
	kind: 'ok' | 'suggest';
	message: string;
};

export type SelectionCheck = {
	valid: boolean;
	reason?: string;
	hints: Record<string, FileHint | undefined>;
};

export function checkSelection(
	simulator: RunnableSimulator,
	required: string[],
	selectedFiles: string[],
	files: InputFiles,
	detection: SimulatorDetection
): SelectionCheck {
	const name = simulatorName(simulator);
	const notSelected = required.filter(file => file in files && !selectedFiles.includes(file));

	const hintFor = (file: string): FileHint | undefined => {
		if (!required.includes(file)) return undefined;

		return selectedFiles.includes(file)
			? { kind: 'ok', message: `Required for ${name}, included in the run` }
			: { kind: 'suggest', message: `Required for ${name}, include it` };
	};

	const failure =
		detection.simulators[simulator].reason ??
		(notSelected.length > 0 ? `Include ${notSelected.join(', ')}` : undefined);

	return {
		valid: failure === undefined,
		reason: failure,
		hints: Object.fromEntries(Object.keys(files).map(file => [file, hintFor(file)]))
	};
}
