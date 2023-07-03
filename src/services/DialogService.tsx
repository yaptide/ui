import { useCallback, useMemo, useState } from 'react';

import { ClearHistoryDialog } from '../ThreeEditor/components/Dialog/ClearHistoryDialog';
import { LoadFileDialog } from '../ThreeEditor/components/Dialog/LoadFileDialog';
import { NewProjectDialog } from '../ThreeEditor/components/Dialog/NewProjectDialog';
import { OpenFileDialog } from '../ThreeEditor/components/Dialog/OpenFileDialog';
import { RunSimulationDialog } from '../ThreeEditor/components/Dialog/RunSimulationDialog';
import { SaveFileDialog } from '../ThreeEditor/components/Dialog/SaveFileDialog';
import {
	DefaultDialogPropsType,
	DialogComponentNames,
	DialogComponentTuple,
	DialogComponentTypeMap,
	DialogContext,
	DialogNameTuple,
	OptionalConfigDialogNames,
	RequiredConfigDialogNames,
	RestDialogPropsType
} from '../types/DialogServiceTypes';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';

const [useDialogContext, DialogContextProvider] = createGenericContext<DialogContext>();

function useDialog<T extends RequiredConfigDialogNames>(
	name: T
): readonly [(props: RestDialogPropsType[T]) => void, () => void, boolean];
function useDialog<T extends OptionalConfigDialogNames>(
	name: T
): readonly [(props?: RestDialogPropsType[T]) => void, () => void, boolean];
function useDialog<T extends DialogComponentNames>(
	name: T
): readonly [
	((props?: RestDialogPropsType[T]) => void) | ((props: RestDialogPropsType[T]) => void),
	() => void,
	boolean
] {
	const { openDialog, closeDialog, getIsOpen } = useDialogContext();
	const open = useCallback(
		(props: RestDialogPropsType[T] = {} as RestDialogPropsType[T]) => {
			openDialog(name, props as RestDialogPropsType[T]);
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
	const [openDialogArray, setOpenDialogArray] = useState<DialogNameTuple[]>([]);

	const closeDialog = useCallback((name: DialogComponentNames) => {
		setOpenDialogArray(prev => prev.filter(([n]) => n !== name));
	}, []);

	const openDialog = useCallback(
		(name: DialogComponentNames, props: RestDialogPropsType[DialogComponentNames]) => {
			setOpenDialogArray(prev => {
				const index = prev.findIndex(([n]) => n === name);

				if (index === -1) {
					return [...prev, [name, props]] as DialogNameTuple[];
				}

				return [
					...prev.slice(0, index),
					[name, props],
					...prev.slice(index + 1)
				] as DialogNameTuple[];
			});
		},
		[]
	);

	const dialogMap = useMemo<DialogComponentTypeMap>(
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

	const defaultDialogProps = useMemo<DefaultDialogPropsType>(
		() =>
			Object.fromEntries(
				Object.keys(dialogMap).map(name => [
					name,
					{
						onClose: () => closeDialog(name as DialogComponentNames)
					}
				])
			) as DefaultDialogPropsType,
		[closeDialog, dialogMap]
	);

	const getIsOpen = useCallback(
		(name: DialogComponentNames) => {
			return openDialogArray.some(([n]) => n === name);
		},
		[openDialogArray]
	);

	const value: DialogContext = {
		openDialog,
		closeDialog,
		getIsOpen
	};

	return (
		<DialogContextProvider value={value}>
			{openDialogArray
				.map(
					([name, props]) =>
						[
							dialogMap[name],
							{ ...defaultDialogProps[name], ...props }
						] as DialogComponentTuple
				)
				.map(([Dialog, props], i) => {
					return (
						<Dialog
							key={i}
							{...(props as any)}
						/>
					);
				})}
			{children}
		</DialogContextProvider>
	);
};

export { DialogProvider, useDialog };
