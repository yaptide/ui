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

type InputFileSpec = {
	required: string[];
	optional: string[];
	extensions: string[];
	singleOfExtension?: string;
	namesMatter: boolean;
	template: InputFiles;
};

export const INPUT_FILE_SPECS: Record<RunnableSimulator, InputFileSpec> = {
	[SimulatorType.SHIELDHIT]: {
		required: ['beam.dat', 'geo.dat', 'mat.dat'],
		optional: ['detect.dat'],
		extensions: ['.dat'],
		namesMatter: true,
		template: { 'beam.dat': '', 'geo.dat': '', 'mat.dat': '', 'detect.dat': '' }
	},
	[SimulatorType.FLUKA]: {
		required: [],
		optional: [],
		extensions: ['.inp'],
		singleOfExtension: '.inp',
		namesMatter: false,
		template: { 'fl_sim.inp': '' }
	},
	[SimulatorType.GEANT4]: {
		required: ['geometry.gdml', 'run.mac'],
		optional: [],
		extensions: ['.gdml', '.mac'],
		namesMatter: true,
		template: { 'geometry.gdml': '', 'run.mac': '' }
	}
};

export type InputFileIssueCode =
	| 'empty_file'
	| 'unknown_file'
	| 'copy_suffix'
	| 'missing_nstat'
	| 'missing_end'
	| 'missing_medium'
	| 'missing_start'
	| 'missing_stop'
	| 'invalid_xml'
	| 'not_gdml'
	| 'missing_beam_on';

export type InputFileIssue = {
	severity: 'error' | 'warning';
	code: InputFileIssueCode;
	message: string;
	suggestedName?: string;
};

const FILE_NAME_ISSUES: InputFileIssueCode[] = ['empty_file', 'unknown_file', 'copy_suffix'];

export const isContentIssue = (issue: InputFileIssue) => !FILE_NAME_ISSUES.includes(issue.code);

export type InputFileInspection = {
	simulator: RunnableSimulator | null;
	issues: InputFileIssue[];
};

export type SimulatorInspection = {
	possible: boolean;
	reason?: string;
	sets: string[][];
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

const isRunnableSimulator = (value: unknown): value is RunnableSimulator =>
	RUNNABLE_SIMULATORS.includes(value as RunnableSimulator);

function simulatorFromInfoJson(content: string): RunnableSimulator | null {
	const match = content.match(/['"]simulator['"]\s*:\s*['"](\w+)['"]/);

	return match && isRunnableSimulator(match[1]) ? match[1] : null;
}

function simulatorFromName(name: string): RunnableSimulator | null {
	return (
		RUNNABLE_SIMULATORS.find(simulator =>
			INPUT_FILE_SPECS[simulator].extensions.some(extension => name.endsWith(extension))
		) ?? null
	);
}

const issue = (
	severity: InputFileIssue['severity'],
	code: InputFileIssueCode,
	message: string
): InputFileIssue => ({ severity, code, message });

const strippedLines = (content: string) => content.split(/\r\n|\r|\n/).map(line => line.trim());

function checkBeamDat(name: string, content: string): InputFileIssue[] {
	return strippedLines(content).some(line => line.startsWith('NSTAT'))
		? []
		: [
				issue(
					'warning',
					'missing_nstat',
					`${name} has no NSTAT line, so the number of primary particles can't be changed`
				)
			];
}

function checkGeoDat(name: string, content: string): InputFileIssue[] {
	return strippedLines(content).filter(line => line === 'END').length >= 2
		? []
		: [
				issue(
					'error',
					'missing_end',
					`${name} needs an END line after the bodies and another after the zones`
				)
			];
}

function checkMatDat(name: string, content: string): InputFileIssue[] {
	const lines = strippedLines(content);

	return lines.some(line => line.startsWith('MEDIUM')) && lines.includes('END')
		? []
		: [issue('error', 'missing_medium', `${name} has no MEDIUM ... END block`)];
}

function checkFlukaInput(name: string, content: string): InputFileIssue[] {
	const lines = strippedLines(content);
	const issues: InputFileIssue[] = [];

	if (!lines.some(line => line.startsWith('START')))
		issues.push(
			issue(
				'error',
				'missing_start',
				`${name} has no START card, so no particles would be simulated`
			)
		);

	if (!lines.some(line => line.startsWith('STOP')))
		issues.push(issue('warning', 'missing_stop', `${name} has no STOP card`));

	return issues;
}

function checkGdml(name: string, content: string): InputFileIssue[] {
	const document = new DOMParser().parseFromString(content.trim(), 'application/xml');

	if (document.getElementsByTagName('parsererror').length > 0)
		return [issue('error', 'invalid_xml', `${name} isn't valid XML`)];

	if (document.documentElement.localName !== 'gdml')
		return [issue('error', 'not_gdml', `${name} has no <gdml> root element`)];

	return [];
}

function checkRunMac(name: string, content: string): InputFileIssue[] {
	return strippedLines(content).some(line => line.startsWith('/run/beamOn'))
		? []
		: [
				issue(
					'error',
					'missing_beam_on',
					`${name} has no /run/beamOn command, so no particles would be simulated`
				)
			];
}

const CONTENT_CHECKS_BY_NAME: Record<string, (name: string, content: string) => InputFileIssue[]> =
	{
		'beam.dat': checkBeamDat,
		'geo.dat': checkGeoDat,
		'mat.dat': checkMatDat,
		'run.mac': checkRunMac
	};

const CONTENT_CHECKS_BY_EXTENSION: [string, (name: string, content: string) => InputFileIssue[]][] =
	[
		['.inp', checkFlukaInput],
		['.gdml', checkGdml]
	];

function contentIssues(name: string, checkedName: string, content: string): InputFileIssue[] {
	const check =
		CONTENT_CHECKS_BY_NAME[checkedName] ??
		CONTENT_CHECKS_BY_EXTENSION.find(([extension]) => checkedName.endsWith(extension))?.[1];

	return check ? check(name, content) : [];
}

function inspectFile(name: string, content: string): InputFileInspection {
	const originalName = nameWithoutCopySuffix(name);
	const simulator =
		name === 'info.json'
			? simulatorFromInfoJson(content)
			: simulatorFromName(originalName ?? name);
	const issues: InputFileIssue[] = [];

	if (originalName)
		issues.push({
			severity: 'warning',
			code: 'copy_suffix',
			message: `Looks like a downloaded copy of ${originalName}`,
			suggestedName: originalName
		});

	if (simulator === null && name !== 'info.json')
		issues.push({
			severity: 'warning',
			code: 'unknown_file',
			message: `Not an input file of ${RUNNABLE_SIMULATORS.map(simulatorName).join(', ')}`
		});

	if (content.trim() === '')
		issues.push({ severity: 'warning', code: 'empty_file', message: 'File is empty' });
	else if (simulator !== null) issues.push(...contentIssues(name, originalName ?? name, content));

	return { simulator, issues };
}

function inspectSimulator(
	simulator: RunnableSimulator,
	files: InputFiles,
	fileResults: Record<string, InputFileInspection>
): SimulatorInspection {
	const spec = INPUT_FILE_SPECS[simulator];
	const isEmpty = (name: string) => files[name].trim() === '';
	const hasCopySuffix = (name: string) =>
		fileResults[name].issues.some(issue => issue.code === 'copy_suffix');

	const missing = spec.required.find(name => !(name in files));

	if (missing) return { possible: false, reason: `${missing} is missing`, sets: [] };

	const empty = spec.required.find(isEmpty);

	if (empty) return { possible: false, reason: `${empty} is empty`, sets: [] };

	const firstError = (name: string) =>
		fileResults[name].issues.find(fileIssue => fileIssue.severity === 'error')?.message;
	const broken = spec.required.find(firstError);

	if (broken) return { possible: false, reason: firstError(broken), sets: [] };

	const ownFiles = Object.keys(files).filter(
		name =>
			fileResults[name].simulator === simulator &&
			!isEmpty(name) &&
			!firstError(name) &&
			!(spec.namesMatter && hasCopySuffix(name))
	);

	if (spec.singleOfExtension) {
		const extension = spec.singleOfExtension;
		const candidates = ownFiles.filter(name => name !== 'info.json');
		const rest = ownFiles.filter(name => !candidates.includes(name));

		if (candidates.length === 0) {
			const ownInputs = Object.keys(files).filter(
				name => fileResults[name].simulator === simulator && name !== 'info.json'
			);
			const brokenInput = ownInputs.find(firstError);

			return {
				possible: false,
				reason: brokenInput
					? firstError(brokenInput)
					: ownInputs.length > 0
						? `The ${extension} file is empty`
						: `No ${extension} file`,
				sets: []
			};
		}

		return { possible: true, sets: candidates.map(candidate => [candidate, ...rest]) };
	}

	return { possible: true, sets: [ownFiles] };
}

export function inspectInputFiles(files: InputFiles): InputFilesInspection {
	const fileResults = Object.fromEntries(
		Object.entries(files).map(([name, content]) => [name, inspectFile(name, content)])
	);

	const simulators = Object.fromEntries(
		RUNNABLE_SIMULATORS.map(simulator => [
			simulator,
			inspectSimulator(simulator, files, fileResults)
		])
	) as Record<RunnableSimulator, SimulatorInspection>;

	return { files: fileResults, simulators };
}

export function sortInputFileNames(names: string[], inspection: InputFilesInspection): string[] {
	const rank = (name: string) => {
		const simulator = inspection.files[name]?.simulator ?? null;
		const simulatorRank =
			simulator === null
				? RUNNABLE_SIMULATORS.length
				: RUNNABLE_SIMULATORS.indexOf(simulator);

		if (name === 'info.json') return [simulatorRank, -1];

		const known = simulator
			? [...INPUT_FILE_SPECS[simulator].required, ...INPUT_FILE_SPECS[simulator].optional]
			: [];
		const knownRank = known.indexOf(name);

		return [simulatorRank, knownRank === -1 ? known.length : knownRank];
	};

	return [...names].sort((a, b) => {
		const [simulatorA, knownA] = rank(a);
		const [simulatorB, knownB] = rank(b);

		return simulatorA - simulatorB || knownA - knownB || a.localeCompare(b);
	});
}

export function matchingSelections(
	simulator: RunnableSimulator,
	files: InputFiles,
	inspection: InputFilesInspection
): string[][] {
	const { sets } = inspection.simulators[simulator];

	if (sets.length > 0) return sets;

	const ownFiles = Object.keys(files).filter(
		name => inspection.files[name].simulator === simulator
	);

	return ownFiles.length > 0 ? [ownFiles] : [];
}

export type FileStatus = 'usable' | 'foreign' | 'empty' | 'invalidContent' | 'renameNeeded';

export type FileHintKind = 'ok' | 'warning' | 'suggest' | 'exclude' | 'invalid' | 'tooMany';

export type FileHint = {
	kind: FileHintKind;
	message: string;
};

export type SelectionCheck = {
	valid: boolean;
	reason?: string;
	hints: Record<string, FileHint | undefined>;
	warnings: string[];
};

export function fileStatus(
	name: string,
	simulator: RunnableSimulator,
	files: InputFiles,
	inspection: InputFilesInspection
): FileStatus {
	const fileInspection = inspection.files[name];

	if (fileInspection.simulator !== simulator) return 'foreign';

	if (files[name].trim() === '') return 'empty';

	if (fileInspection.issues.some(issue => issue.severity === 'error')) return 'invalidContent';

	if (
		INPUT_FILE_SPECS[simulator].namesMatter &&
		fileInspection.issues.some(issue => issue.code === 'copy_suffix')
	)
		return 'renameNeeded';

	return 'usable';
}

export function checkSelection(
	simulator: RunnableSimulator,
	selectedFiles: string[],
	files: InputFiles,
	inspection: InputFilesInspection
): SelectionCheck {
	const spec = INPUT_FILE_SPECS[simulator];
	const name = simulatorName(simulator);
	const extension = spec.singleOfExtension;
	const names = Object.keys(files);
	const selected = selectedFiles.filter(file => file in files);
	const statuses = Object.fromEntries(
		names.map(file => [file, fileStatus(file, simulator, files, inspection)])
	);

	const candidates = extension
		? names.filter(file => statuses[file] === 'usable' && file !== 'info.json')
		: [];
	const selectedCandidates = candidates.filter(file => selected.includes(file));

	const suggestedName = (file: string) =>
		inspection.files[file].issues.find(issue => issue.suggestedName)?.suggestedName;

	const contentIssues = (file: string, severity: InputFileIssue['severity']) =>
		inspection.files[file].issues.filter(
			issue => isContentIssue(issue) && issue.severity === severity
		);

	const foreignMessage = (file: string) => {
		const fileSimulator = inspection.files[file].simulator;

		return fileSimulator
			? `${file} is a ${simulatorName(fileSimulator)} file, exclude it to run ${name}`
			: `${file} isn't an input file of ${name}, exclude it`;
	};

	const invalidMessage = (file: string, isSelected: boolean) => {
		const action = isSelected ? ' or exclude it' : '';

		if (statuses[file] === 'empty') return `${file} is empty, fill it in${action}`;

		if (statuses[file] === 'invalidContent') return contentIssues(file, 'error')[0].message;

		return `Rename ${file} to ${suggestedName(file)}${action}`;
	};

	const hintFor = (file: string): FileHint | undefined => {
		const status = statuses[file];
		const isSelected = selected.includes(file);
		const isRequired = spec.required.includes(file);

		if (isSelected) {
			if (status === 'foreign') return { kind: 'exclude', message: foreignMessage(file) };

			if (status !== 'usable')
				return { kind: 'invalid', message: invalidMessage(file, true) };

			if (candidates.includes(file) && selectedCandidates.length > 1)
				return {
					kind: 'tooMany',
					message: `Only one ${extension} file can be used, exclude the others`
				};

			const warning = contentIssues(file, 'warning')[0];

			if (warning) return { kind: 'warning', message: warning.message };

			return { kind: 'ok', message: 'Included in the run' };
		}

		if (isRequired && status !== 'usable')
			return { kind: 'invalid', message: invalidMessage(file, false) };

		if (isRequired) return { kind: 'suggest', message: `Required for ${name}, include it` };

		if (candidates.includes(file) && selectedCandidates.length === 0)
			return {
				kind: 'suggest',
				message:
					candidates.length === 1
						? `Required for ${name}, include it`
						: `Choose one ${extension} file`
			};

		return undefined;
	};

	const hints = Object.fromEntries(names.map(file => [file, hintFor(file)]));

	const firstSelected = (status: FileStatus | FileStatus[]) =>
		selected.find(file => ([] as FileStatus[]).concat(status).includes(statuses[file]));
	const { possible, reason } = inspection.simulators[simulator];
	const foreign = firstSelected('foreign');
	const invalid = firstSelected(['empty', 'invalidContent', 'renameNeeded']);
	const notSelected = spec.required.find(file => !selected.includes(file));

	let failure: string | undefined;

	if (!possible) failure = reason;
	else if (foreign) failure = `Exclude ${foreign}, it isn't a ${name} file`;
	else if (invalid) failure = invalidMessage(invalid, true);
	else if (notSelected) failure = `Include ${notSelected}`;
	else if (extension && selectedCandidates.length === 0)
		failure =
			candidates.length === 1 ? `Include ${candidates[0]}` : `Select one ${extension} file`;
	else if (extension && selectedCandidates.length > 1)
		failure = `Select only one ${extension} file`;
	else if (selected.length === 0) failure = 'Select files to run';

	const warnings = selected.flatMap(file =>
		statuses[file] === 'usable'
			? contentIssues(file, 'warning').map(warning => warning.message)
			: []
	);

	return { valid: failure === undefined, reason: failure, hints, warnings };
}
