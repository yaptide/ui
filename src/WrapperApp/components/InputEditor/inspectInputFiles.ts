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

export const REQUIRED_INPUT_FILES: Record<RunnableSimulator, string[]> = {
	[SimulatorType.SHIELDHIT]: ['beam.dat', 'geo.dat', 'mat.dat', 'detect.dat'],
	[SimulatorType.FLUKA]: ['fl_sim.inp'],
	[SimulatorType.GEANT4]: ['geometry.gdml', 'run.mac']
};

export const emptyTemplate = (simulator: RunnableSimulator): InputFiles =>
	Object.fromEntries(REQUIRED_INPUT_FILES[simulator].map(name => [name, '']));

export type InputFileIssue = {
	severity: 'warning';
	code: 'copy_suffix';
	message: string;
	suggestedName: string;
};

export type InputFileInspection = {
	simulator: RunnableSimulator | null;
	issues: InputFileIssue[];
};

export type SimulatorInspection = {
	possible: boolean;
	reason?: string;
	missing: string[];
};

export type InputFilesInspection = {
	files: Record<string, InputFileInspection>;
	simulators: Record<RunnableSimulator, SimulatorInspection>;
};

export const simulatorName = (simulator: RunnableSimulator) =>
	SimulatorNames.get(simulator) ?? simulator;

const COPY_SUFFIX_AFTER_EXTENSION = /^(.+\.(?:dat|inp|gdml|mac|json))\d+$/;
const COPY_SUFFIX_BEFORE_EXTENSION = /^(.+?)(?: ?\(\d+\)|-\d+| \d+)(\.[A-Za-z0-9]+)$/;

export function nameWithoutCopySuffix(name: string): string | undefined {
	const afterExtension = name.match(COPY_SUFFIX_AFTER_EXTENSION);

	if (afterExtension) return afterExtension[1];

	const beforeExtension = name.match(COPY_SUFFIX_BEFORE_EXTENSION);

	if (beforeExtension) return beforeExtension[1] + beforeExtension[2];

	return undefined;
}

export const requiredBy = (name: string): RunnableSimulator | null =>
	RUNNABLE_SIMULATORS.find(simulator => REQUIRED_INPUT_FILES[simulator].includes(name)) ?? null;

function inspectFile(name: string): InputFileInspection {
	const originalName = nameWithoutCopySuffix(name);

	return {
		simulator: requiredBy(name),
		issues: originalName
			? [
					{
						severity: 'warning',
						code: 'copy_suffix',
						message: `Looks like a downloaded copy of ${originalName}`,
						suggestedName: originalName
					}
				]
			: []
	};
}

function inspectSimulator(simulator: RunnableSimulator, files: InputFiles): SimulatorInspection {
	const missing = REQUIRED_INPUT_FILES[simulator].filter(name => !(name in files));

	return missing.length === 0
		? { possible: true, missing }
		: { possible: false, reason: `Missing ${missing.join(', ')}`, missing };
}

export function inspectInputFiles(files: InputFiles): InputFilesInspection {
	const fileResults = Object.fromEntries(
		Object.keys(files).map(name => [name, inspectFile(name)])
	);

	const simulators = Object.fromEntries(
		RUNNABLE_SIMULATORS.map(simulator => [simulator, inspectSimulator(simulator, files)])
	) as Record<RunnableSimulator, SimulatorInspection>;

	return { files: fileResults, simulators };
}

export function sortInputFileNames(names: string[], inspection: InputFilesInspection): string[] {
	const rank = (name: string) => {
		const simulator = inspection.files[name]?.simulator ?? null;

		return simulator === null
			? [RUNNABLE_SIMULATORS.length, 0]
			: [
					RUNNABLE_SIMULATORS.indexOf(simulator),
					REQUIRED_INPUT_FILES[simulator].indexOf(name)
				];
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
	selectedFiles: string[],
	files: InputFiles,
	inspection: InputFilesInspection
): SelectionCheck {
	const required = REQUIRED_INPUT_FILES[simulator];
	const name = simulatorName(simulator);
	const notSelected = required.filter(file => file in files && !selectedFiles.includes(file));

	const hintFor = (file: string): FileHint | undefined => {
		if (!required.includes(file)) return undefined;

		return selectedFiles.includes(file)
			? { kind: 'ok', message: `Required for ${name}, included in the run` }
			: { kind: 'suggest', message: `Required for ${name}, include it` };
	};

	const failure =
		inspection.simulators[simulator].reason ??
		(notSelected.length > 0 ? `Include ${notSelected.join(', ')}` : undefined);

	return {
		valid: failure === undefined,
		reason: failure,
		hints: Object.fromEntries(Object.keys(files).map(file => [file, hintFor(file)]))
	};
}

export const presentRequiredFiles = (simulator: RunnableSimulator, files: InputFiles) =>
	REQUIRED_INPUT_FILES[simulator].filter(name => name in files);
