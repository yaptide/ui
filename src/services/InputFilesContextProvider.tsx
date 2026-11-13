import { useCallback, useEffect, useRef, useState } from 'react';

import { usePythonConverter } from '../PythonConverter/PythonConverterService';
import { InputFilesLoss } from '../WrapperApp/components/InputEditor/OverwriteInputFilesDialog';
import {
	inputFilesZipName,
	saveInputFile,
	saveInputFilesAsZip
} from '../WrapperApp/components/InputEditor/saveInputFiles';
import {
	InputFiles,
	RequiredInputFiles,
	RUNNABLE_SIMULATORS,
	RunnableSimulator,
	SimulatorDetection
} from '../WrapperApp/components/InputEditor/simulatorDetection';
import { useDialog } from './DialogService';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';
import { useStore } from './StoreService';

export type SelectionUpdate = 'replace' | 'add';

export const DETECTION_ERROR =
	"Couldn't check the input files. Reload the page to load the converter again.";

export interface InputFilesContext {
	inputFiles: InputFiles;
	selectedFiles: string[];
	detection?: SimulatorDetection;
	lastDetection?: SimulatorDetection;
	detectionError?: string;
	requiredFiles?: RequiredInputFiles;
	runSimulator: RunnableSimulator;
	additionCount: number;
	filesFromAnotherProject: boolean;
	filesTitle?: string;
	addFiles: (
		files: InputFiles,
		selection: SelectionUpdate,
		action: string,
		title?: string
	) => Promise<boolean>;
	updateFile: (name: string, content: string) => void;
	clearFile: (name: string) => Promise<boolean>;
	removeFile: (name: string) => Promise<boolean>;
	renameFile: (from: string, to: string) => Promise<boolean>;
	toggleSelected: (name: string) => void;
	setSelectedFiles: (names: string[]) => void;
	setRunSimulator: (simulator: RunnableSimulator) => void;
}

const [useInputFiles, InputFilesContextProvider] = createGenericContext<InputFilesContext>();

const InputFilesProvider = ({ children }: GenericContextProviderProps) => {
	const { yaptideEditor } = useStore();
	const { open: openOverwriteDialog } = useDialog('overwriteInputFiles');
	const [inputFiles, setInputFiles] = useState<InputFiles>({});
	const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
	const [additionCount, setAdditionCount] = useState(0);
	const { isConverterReady, detectSimulators, requiredInputFiles } = usePythonConverter();
	const [requiredFiles, setRequiredFiles] = useState<RequiredInputFiles>();
	const [detected, setDetected] = useState<{ names: string; detection: SimulatorDetection }>();
	const [detectionError, setDetectionError] = useState<string>();
	const [runSimulator, setRunSimulator] = useState<RunnableSimulator>(RUNNABLE_SIMULATORS[0]);
	const [pendingSwitch, setPendingSwitch] = useState<string[]>();
	const [projectChanged, setProjectChanged] = useState(false);
	const [filesTitle, setFilesTitle] = useState<string>();
	const names = Object.keys(inputFiles).join('\n');
	const detection = detected?.names === names ? detected.detection : undefined;
	const lastDetection = detected?.detection;
	const hasInputFiles = names !== '';

	const reportDetectionError = useCallback((error: unknown) => {
		console.error(error);
		setDetectionError(DETECTION_ERROR);
	}, []);

	useEffect(() => {
		if (isConverterReady)
			requiredInputFiles().then(setRequiredFiles).catch(reportDetectionError);
	}, [isConverterReady, requiredInputFiles, reportDetectionError]);

	useEffect(() => {
		if (!isConverterReady) return;
		let current = true;
		const files = Object.fromEntries(
			names
				.split('\n')
				.filter(Boolean)
				.map(name => [name, ''])
		);

		detectSimulators(files)
			.then(result => {
				if (current) setDetected({ names, detection: result });
			})
			.catch(reportDetectionError);

		return () => {
			current = false;
		};
	}, [isConverterReady, detectSimulators, names, reportDetectionError]);

	useEffect(() => {
		if (!pendingSwitch || !detection) return;

		const simulators = new Set(
			pendingSwitch.flatMap(name => detection.files[name]?.simulator ?? [])
		);

		if (simulators.size === 1) setRunSimulator(Array.from(simulators)[0]);
		setPendingSwitch(undefined);
	}, [pendingSwitch, detection]);

	useEffect(() => {
		if (!yaptideEditor) return;
		const { projectChanged: loaded, editorCleared: cleared } = yaptideEditor.signals;
		const markChanged = () => setProjectChanged(true);

		loaded.add(markChanged);
		cleared.add(markChanged);

		return () => {
			loaded.remove(markChanged);
			cleared.remove(markChanged);
		};
	}, [yaptideEditor]);

	const latestFiles = useRef(inputFiles);
	const latestSelection = useRef(selectedFiles);
	const latestDetection = useRef(lastDetection);
	const pendingDialog = useRef<Promise<unknown>>(Promise.resolve());

	useEffect(() => {
		latestFiles.current = inputFiles;
		latestSelection.current = selectedFiles;
		latestDetection.current = lastDetection;
	}, [inputFiles, selectedFiles, lastDetection]);

	const askAboutLoss = useCallback(
		(kind: InputFilesLoss, action: string, incoming: InputFiles) => {
			const current = latestFiles.current;
			const lost = Object.keys(incoming).filter(
				name =>
					name in current &&
					current[name].trim() !== '' &&
					current[name] !== incoming[name]
			);

			if (lost.length === 0) return Promise.resolve(true);

			return new Promise<boolean>(resolve =>
				openOverwriteDialog({
					kind,
					action,
					fileNames: lost,
					onCancel: () => resolve(false),
					onOverwrite: downloadCurrent => {
						if (downloadCurrent) {
							const lostFiles = Object.fromEntries(
								lost.map(name => [name, current[name]])
							);

							if (lost.length === 1) saveInputFile(lost[0], current[lost[0]]);
							else
								saveInputFilesAsZip(
									lostFiles,
									inputFilesZipName(
										yaptideEditor?.config.getKey('project/title'),
										lostFiles,
										latestDetection.current
									)
								);
						}

						resolve(true);
					}
				})
			);
		},
		[openOverwriteDialog, yaptideEditor]
	);

	const confirmLoss = useCallback(
		(kind: InputFilesLoss, action: string, incoming: InputFiles) => {
			const answer = pendingDialog.current.then(() => askAboutLoss(kind, action, incoming));

			pendingDialog.current = answer.catch(() => undefined);

			return answer;
		},
		[askAboutLoss]
	);

	const addFiles = useCallback(
		async (files: InputFiles, selection: SelectionUpdate, action: string, title?: string) => {
			if (!(await confirmLoss('overwrite', action, files))) return false;

			const hadFiles = Object.keys(latestFiles.current).length > 0;
			const added = Object.keys(files);
			const addSelection = (old: string[]) =>
				selection === 'replace'
					? added
					: [...old, ...added.filter(name => !old.includes(name))];

			setInputFiles(old => ({ ...old, ...files }));
			setSelectedFiles(addSelection);
			setAdditionCount(count => count + 1);
			setProjectChanged(false);

			if (selection === 'replace' || !hadFiles) setFilesTitle(title);
			setPendingSwitch(old =>
				selection === 'replace' || !old
					? added
					: [...old, ...added.filter(name => !old.includes(name))]
			);

			return true;
		},
		[confirmLoss]
	);

	const updateFile = useCallback((name: string, content: string) => {
		setInputFiles(old => ({ ...old, [name]: content }));
	}, []);

	const clearFile = useCallback(
		async (name: string) => {
			if (!(await confirmLoss('discard', `Clearing ${name}`, { [name]: '' }))) return false;

			updateFile(name, '');

			return true;
		},
		[confirmLoss, updateFile]
	);

	const removeFile = useCallback(
		async (name: string) => {
			if (!(await confirmLoss('discard', `Deleting ${name}`, { [name]: '' }))) return false;

			setInputFiles(({ [name]: _, ...rest }) => rest);
			setSelectedFiles(old => old.filter(file => file !== name));

			return true;
		},
		[confirmLoss]
	);

	const renameFile = useCallback(
		async (from: string, to: string) => {
			const content = latestFiles.current[from];

			if (!(await confirmLoss('overwrite', `Renaming ${from} to ${to}`, { [to]: content })))
				return false;

			const wasSelected = latestSelection.current.includes(from);

			setInputFiles(({ [from]: _, ...rest }) => ({ ...rest, [to]: content }));
			setSelectedFiles(old => {
				const renamed = old.filter(file => file !== from && file !== to);

				return old.includes(from) ? [...renamed, to] : renamed;
			});

			if (wasSelected) setPendingSwitch([to]);

			return true;
		},
		[confirmLoss]
	);

	const toggleSelected = useCallback((name: string) => {
		setSelectedFiles(old =>
			old.includes(name) ? old.filter(file => file !== name) : [...old, name]
		);
	}, []);

	const value: InputFilesContext = {
		inputFiles,
		selectedFiles,
		detection,
		lastDetection,
		detectionError,
		requiredFiles,
		runSimulator,
		additionCount,
		filesFromAnotherProject: hasInputFiles && projectChanged,
		filesTitle,
		addFiles,
		updateFile,
		clearFile,
		removeFile,
		renameFile,
		toggleSelected,
		setSelectedFiles,
		setRunSimulator
	};

	return <InputFilesContextProvider value={value}>{children}</InputFilesContextProvider>;
};

export { InputFilesProvider, useInputFiles };
