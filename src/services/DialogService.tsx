import { useCallback, useMemo, useState } from 'react';

import { ChangeScoringTypeDialog } from '../ThreeEditor/components/Dialog/ChangeScoringTypeDialog';
import { ClearHistoryDialog } from '../ThreeEditor/components/Dialog/ClearHistoryDialog';
import { EditProjectInfoDialog } from '../ThreeEditor/components/Dialog/EditProjectInfoDialog';
import { LoadFileDialog } from '../ThreeEditor/components/Dialog/LoadFileDialog';
import { NewProjectDialog } from '../ThreeEditor/components/Dialog/NewProjectDialog';
import { OpenFileDialog } from '../ThreeEditor/components/Dialog/OpenFileDialog';
import { RejectKeycloakRefreshUserDialog } from '../ThreeEditor/components/Dialog/RejectKeycloakRefreshUserDialog';
import { RejectKeycloakUserDialog } from '../ThreeEditor/components/Dialog/RejectKeycloakUserDialog';
import { SaveFileDialog } from '../ThreeEditor/components/Dialog/SaveFileDialog';
import { SimulatorChangeDialog } from '../ThreeEditor/components/Dialog/SimulatorChangeDialog';
import {
	DefaultDialogPropsType,
	DialogComponentNames,
	DialogComponentTuple,
	DialogContext,
	DialogNameTuple,
	OptionalConfigDialogNames,
	RequiredConfigDialogNames,
	RestDialogPropsType,
	ValidComponentTypes
} from '../types/DialogServiceTypes';
import { EntriesToObj } from '../types/TypeTransformUtil';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';

/**
 * Defines a mapping of dialog component names to their respective component types.
 * The keys of the map are the names of the dialog components, and the values are the component types.
 * The component types are validated to ensure they are of type `ConcreteDialogComponent`.
 * If you want to add a new dialog component, add it to the list below and all necessary changes will be automatically highlighted.
 */
export type DialogComponentTypeMap = EntriesToObj<
	[
		ValidComponentTypes<['clearHistory', typeof ClearHistoryDialog]>,
		ValidComponentTypes<['loadFile', typeof LoadFileDialog]>,
		ValidComponentTypes<['newProject', typeof NewProjectDialog]>,
		ValidComponentTypes<['openFile', typeof OpenFileDialog]>,
		ValidComponentTypes<['saveFile', typeof SaveFileDialog]>,
		ValidComponentTypes<['editProject', typeof EditProjectInfoDialog]>,
		ValidComponentTypes<['rejectKeycloak', typeof RejectKeycloakUserDialog]>,
		ValidComponentTypes<['rejectKeycloakRefresh', typeof RejectKeycloakRefreshUserDialog]>,
		ValidComponentTypes<['changeScoringType', typeof ChangeScoringTypeDialog]>,
		ValidComponentTypes<['simulatorChange', typeof SimulatorChangeDialog]>
	]
>;

const [useDialogContext, DialogContextProvider] = createGenericContext<DialogContext>();

function useDialog<T extends RequiredConfigDialogNames>(
	name: T
): {
	open: (props: RestDialogPropsType[T]) => void;
	close: () => void;
	isOpen: boolean;
};
function useDialog<T extends OptionalConfigDialogNames>(
	name: T
): { open: (props?: RestDialogPropsType[T]) => void; close: () => void; isOpen: boolean };
function useDialog<T extends DialogComponentNames>(
	name: T
): {
	open: ((props?: RestDialogPropsType[T]) => void) | ((props: RestDialogPropsType[T]) => void);
	close: () => void;
	isOpen: boolean;
} {
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

	return { open, close, isOpen };
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
			saveFile: SaveFileDialog,
			editProject: EditProjectInfoDialog,
			rejectKeycloak: RejectKeycloakUserDialog,
			rejectKeycloakRefresh: RejectKeycloakRefreshUserDialog,
			changeScoringType: ChangeScoringTypeDialog,
			simulatorChange: SimulatorChangeDialog
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
