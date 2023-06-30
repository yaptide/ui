import { useCallback, useMemo, useState } from 'react';

import { ClearHistoryDialog } from '../ThreeEditor/components/Dialog/ClearHistoryDialog';
import { LoadFileDialog } from '../ThreeEditor/components/Dialog/LoadFileDialog';
import { NewProjectDialog } from '../ThreeEditor/components/Dialog/NewProjectDialog';
import { OpenFileDialog } from '../ThreeEditor/components/Dialog/OpenFileDialog';
import { RunSimulationDialog } from '../ThreeEditor/components/Dialog/RunSimulationDialog';
import { SaveFileDialog } from '../ThreeEditor/components/Dialog/SaveFileDialog';
import { ArgumentsType } from '../types/TypeTransformUtil';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';
import { useStore } from './StoreService';

type DialogComponentTypeMap = {
	clearHistory: typeof ClearHistoryDialog;
	loadFile: typeof LoadFileDialog;
	newProject: typeof NewProjectDialog;
	openFile: typeof OpenFileDialog;
	runSimulation: typeof RunSimulationDialog;
	saveFile: typeof SaveFileDialog;
};

type DialogPropsTypeMap = {
	[K in keyof DialogComponentTypeMap]: ArgumentsType<DialogComponentTypeMap[K]>[0];
};

type DialogTuple<T extends keyof DialogComponentTypeMap = keyof DialogComponentTypeMap> =
	T extends T ? [T, Partial<DialogPropsTypeMap[T]>] : never;

export interface DialogContext2 {
	openDialog<T extends keyof DialogPropsTypeMap>(
		name: T,
		props: Partial<DialogPropsTypeMap[T]>
	): void;
	closeDialog<T extends keyof DialogPropsTypeMap>(name: T): void;
	getIsOpen<T extends keyof DialogPropsTypeMap>(name: T): boolean;
}
const [useDialogContext, DialogContextProvider2] = createGenericContext<DialogContext2>();
function useDialog<T extends keyof DialogPropsTypeMap>(name: T) {
	const { openDialog, closeDialog, getIsOpen } = useDialogContext();
	const open = useCallback(
		(props?: Partial<DialogPropsTypeMap[T]>) => {
			openDialog(name, props ?? {});
		},
		[name, openDialog]
	);
	const close = useCallback(() => {
		closeDialog(name);
	}, [name, closeDialog]);
	const isOpen = useMemo(() => getIsOpen(name), [name, getIsOpen]);
	return [open, close, isOpen] as const;
}
const DialogProvider = ({ children }: GenericContextProviderProps) => {
	const { editorRef } = useStore();
	const [openDialogArray, setOpenDialogArray] = useState<DialogTuple[]>([]);

	const dialogMap = useMemo(
		() => ({
			clearHistory: ClearHistoryDialog,
			loadFile: LoadFileDialog,
			newProject: NewProjectDialog,
			openFile: OpenFileDialog,
			runSimulation: RunSimulationDialog,
			saveFile: SaveFileDialog
		}),
		[]
	);

	const closeDialog = useCallback((name: keyof DialogComponentTypeMap) => {
		setOpenDialogArray(prev => prev.filter(([n]) => n !== name));
	}, []);

	const openDialog = useCallback(
		(
			name: keyof DialogComponentTypeMap,
			props: Partial<DialogPropsTypeMap[keyof DialogPropsTypeMap]>
		) => {
			setOpenDialogArray(prev => {
				const index = prev.findIndex(([n]) => n === name);
				if (index === -1) {
					return [...prev, [name, props]] as DialogTuple[];
				}
				return [
					...prev.slice(0, index),
					[name, props],
					...prev.slice(index + 1)
				] as DialogTuple[];
			});
		},
		[]
	);

	const defaultDialogProps = useMemo<DialogPropsTypeMap>(
		() => ({
			clearHistory: {
				onClose: () => closeDialog('clearHistory'),
				editor: editorRef.current
			},
			loadFile: {
				onClose: () => closeDialog('loadFile'),
				editor: editorRef.current
			},
			newProject: {
				onClose: () => closeDialog('newProject'),
				editor: editorRef.current
			},
			openFile: {
				onClose: () => closeDialog('openFile'),
				editor: editorRef.current
			},
			runSimulation: {
				onClose: () => closeDialog('runSimulation'),
				editor: editorRef.current
			},
			saveFile: {
				onClose: () => closeDialog('saveFile'),
				editor: editorRef.current
			}
		}),
		[closeDialog, editorRef]
	);

	const getIsOpen = useCallback(
		(name: keyof DialogComponentTypeMap) => {
			return openDialogArray.some(([n]) => n === name);
		},
		[openDialogArray]
	);

	const value: DialogContext2 = {
		openDialog,
		closeDialog,
		getIsOpen
	};

	return (
		<DialogContextProvider2 value={value}>
			{openDialogArray.map(([name, props]) => {
				const Dialog = dialogMap[name];
				return (
					<Dialog
						key={name}
						{...defaultDialogProps[name]}
						{...props}
					/>
				);
			})}
			{children}
		</DialogContextProvider2>
	);
};

export { DialogProvider, useDialog };
