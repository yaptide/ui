import { useCallback, useMemo, useState } from 'react';

import {
	InputFiles,
	InputFilesInspection,
	inspectInputFiles,
	RUNNABLE_SIMULATORS,
	RunnableSimulator
} from '../WrapperApp/components/InputEditor/inspectInputFiles';
import {
	inputFilesZipName,
	saveInputFilesAsZip
} from '../WrapperApp/components/InputEditor/saveInputFiles';
import { useDialog } from './DialogService';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';
import { useStore } from './StoreService';

export type SelectionUpdate = 'replace' | 'add';

export interface InputFilesContext {
	inputFiles: InputFiles;
	selectedFiles: string[];
	inspection: InputFilesInspection;
	runSimulator: RunnableSimulator;
	additionCount: number;
	addFiles: (files: InputFiles, selection: SelectionUpdate, action: string) => Promise<boolean>;
	updateFile: (name: string, content: string) => void;
	removeFile: (name: string) => void;
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
	const inspection = useMemo(() => inspectInputFiles(inputFiles), [inputFiles]);

	const [runSimulator, setRunSimulator] = useState<RunnableSimulator>(RUNNABLE_SIMULATORS[0]);

	const confirmOverwrite = useCallback(
		(action: string, incoming: InputFiles) => {
			const overwritten = Object.keys(incoming).filter(
				name =>
					name in inputFiles &&
					inputFiles[name].trim() !== '' &&
					inputFiles[name] !== incoming[name]
			);

			if (overwritten.length === 0) return Promise.resolve(true);

			return new Promise<boolean>(resolve =>
				openOverwriteDialog({
					action,
					fileNames: overwritten,
					onCancel: () => resolve(false),
					onOverwrite: downloadCurrent => {
						if (downloadCurrent) {
							const current = Object.fromEntries(
								overwritten.map(name => [name, inputFiles[name]])
							);

							saveInputFilesAsZip(
								current,
								inputFilesZipName(
									yaptideEditor?.config.getKey('project/title'),
									current,
									inspection
								)
							);
						}

						resolve(true);
					}
				})
			);
		},
		[inputFiles, inspection, openOverwriteDialog, yaptideEditor]
	);

	const addFiles = useCallback(
		async (files: InputFiles, selection: SelectionUpdate, action: string) => {
			if (!(await confirmOverwrite(action, files))) return false;

			const nextFiles = { ...inputFiles, ...files };
			const nextSelection =
				selection === 'replace'
					? Object.keys(files)
					: [
							...selectedFiles,
							...Object.keys(files).filter(name => !selectedFiles.includes(name))
						];
			const nextInspection = inspectInputFiles(nextFiles);
			const selectedSimulators = nextSelection
				.map(name => nextInspection.files[name].simulator)
				.filter((simulator, index, all) => simulator && all.indexOf(simulator) === index);

			setInputFiles(nextFiles);
			setSelectedFiles(nextSelection);
			setAdditionCount(count => count + 1);

			if (selectedSimulators.length === 1 && selectedSimulators[0])
				setRunSimulator(selectedSimulators[0]);

			return true;
		},
		[confirmOverwrite, inputFiles, selectedFiles]
	);

	const updateFile = useCallback((name: string, content: string) => {
		setInputFiles(old => ({ ...old, [name]: content }));
	}, []);

	const removeFile = useCallback((name: string) => {
		setInputFiles(({ [name]: _, ...rest }) => rest);
		setSelectedFiles(old => old.filter(file => file !== name));
	}, []);

	const renameFile = useCallback(
		async (from: string, to: string) => {
			if (!(await confirmOverwrite(`Renaming ${from} to ${to}`, { [to]: inputFiles[from] })))
				return false;

			setInputFiles(({ [from]: content, ...rest }) => ({ ...rest, [to]: content }));
			setSelectedFiles(old => {
				const renamed = old.filter(file => file !== from && file !== to);

				return old.includes(from) ? [...renamed, to] : renamed;
			});

			return true;
		},
		[confirmOverwrite, inputFiles]
	);

	const toggleSelected = useCallback((name: string) => {
		setSelectedFiles(old =>
			old.includes(name) ? old.filter(file => file !== name) : [...old, name]
		);
	}, []);

	const value: InputFilesContext = {
		inputFiles,
		selectedFiles,
		inspection,
		runSimulator,
		additionCount,
		addFiles,
		updateFile,
		removeFile,
		renameFile,
		toggleSelected,
		setSelectedFiles,
		setRunSimulator
	};

	return <InputFilesContextProvider value={value}>{children}</InputFilesContextProvider>;
};

export { InputFilesProvider, useInputFiles };
