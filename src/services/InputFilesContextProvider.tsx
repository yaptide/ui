import { useCallback, useEffect, useRef, useState } from 'react';

import { usePythonConverter } from '../PythonConverter/PythonConverterService';
import { InputFilesLoss } from '../WrapperApp/components/InputEditor/OverwriteInputFilesDialog';
import {
	inputFilesZipName,
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
	detectionError?: string;
	requiredFiles?: RequiredInputFiles;
	runSimulator: RunnableSimulator;
	additionCount: number;
	addFiles: (files: InputFiles, selection: SelectionUpdate, action: string) => Promise<boolean>;
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
	const names = Object.keys(inputFiles).join('\n');
	const detection = detected?.names === names ? detected.detection : undefined;

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

	const [runSimulator, setRunSimulator] = useState<RunnableSimulator>(RUNNABLE_SIMULATORS[0]);

	const latestFiles = useRef(inputFiles);
	const latestSelection = useRef(selectedFiles);
	const converterReady = useRef(isConverterReady);

	useEffect(() => {
		latestFiles.current = inputFiles;
		latestSelection.current = selectedFiles;
		converterReady.current = isConverterReady;
	}, [inputFiles, selectedFiles, isConverterReady]);

	const confirmLoss = useCallback(
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

							saveInputFilesAsZip(
								lostFiles,
								inputFilesZipName(
									yaptideEditor?.config.getKey('project/title'),
									lostFiles,
									detection
								)
							);
						}

						resolve(true);
					}
				})
			);
		},
		[detection, openOverwriteDialog, yaptideEditor]
	);

	const switchToOnlySimulator = useCallback(
		async (names: string[], selection: string[]) => {
			if (!converterReady.current) return;

			const nextDetection = await detectSimulators(
				Object.fromEntries(names.map(name => [name, '']))
			);

			const simulators = new Set(
				selection.flatMap(name => nextDetection.files[name]?.simulator ?? [])
			);

			if (simulators.size === 1) setRunSimulator(Array.from(simulators)[0]);
		},
		[detectSimulators]
	);

	const addFiles = useCallback(
		async (files: InputFiles, selection: SelectionUpdate, action: string) => {
			if (!(await confirmLoss('overwrite', action, files))) return false;

			const added = Object.keys(files);
			const addSelection = (old: string[]) =>
				selection === 'replace'
					? added
					: [...old, ...added.filter(name => !old.includes(name))];
			const names = Object.keys({ ...latestFiles.current, ...files });
			const nextSelection = addSelection(latestSelection.current);

			setInputFiles(old => ({ ...old, ...files }));
			setSelectedFiles(addSelection);
			setAdditionCount(count => count + 1);
			await switchToOnlySimulator(names, nextSelection);

			return true;
		},
		[confirmLoss, switchToOnlySimulator]
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

			const rename = (old: string[]) => {
				const renamed = old.filter(file => file !== from && file !== to);

				return old.includes(from) ? [...renamed, to] : renamed;
			};
			const names = rename(Object.keys(latestFiles.current));
			const nextSelection = rename(latestSelection.current);

			setInputFiles(({ [from]: _, ...rest }) => ({ ...rest, [to]: content }));
			setSelectedFiles(rename);
			await switchToOnlySimulator(names, nextSelection);

			return true;
		},
		[confirmLoss, switchToOnlySimulator]
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
		detectionError,
		requiredFiles,
		runSimulator,
		additionCount,
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
