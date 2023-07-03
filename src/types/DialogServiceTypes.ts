import { ClearHistoryDialog } from '../ThreeEditor/components/Dialog/ClearHistoryDialog';
import { ConcreteDialogProps } from '../ThreeEditor/components/Dialog/CustomDialog';
import { LoadFileDialog } from '../ThreeEditor/components/Dialog/LoadFileDialog';
import { NewProjectDialog } from '../ThreeEditor/components/Dialog/NewProjectDialog';
import { OpenFileDialog } from '../ThreeEditor/components/Dialog/OpenFileDialog';
import { RunSimulationDialog } from '../ThreeEditor/components/Dialog/RunSimulationDialog';
import { SaveFileDialog } from '../ThreeEditor/components/Dialog/SaveFileDialog';
import { EntriesToObj, RequiredKeys } from './TypeTransformUtil';

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
		ValidComponentTypes<['runSimulation', typeof RunSimulationDialog]>,
		ValidComponentTypes<['saveFile', typeof SaveFileDialog]>
	]
>;

export type DialogContext = {
	openDialog<T extends DialogComponentNames>(name: T, props: RestDialogPropsType[T]): void;
	closeDialog<T extends DialogComponentNames>(name: T): void;
	getIsOpen<T extends DialogComponentNames>(name: T): boolean;
};

type ValidArgumentsType<T> = T extends (...args: [infer A]) => unknown
	? A extends ConcreteDialogProps
		? T
		: never
	: never;

type ValidComponentTypes<T extends [string, ValidArgumentsType<T[1]>]> = T;

export type DialogComponentNames = keyof DialogComponentTypeMap;

export type RestDialogPropsType = {
	[K in DialogComponentNames]: Omit<Parameters<DialogComponentTypeMap[K]>[0], 'onClose'>;
};

export type DefaultDialogPropsType = {
	[K in DialogComponentNames]: Pick<Parameters<DialogComponentTypeMap[K]>[0], 'onClose'>;
};

export type RequiredConfigDialogNames<T extends DialogComponentNames = DialogComponentNames> =
	T extends T ? ([RequiredKeys<RestDialogPropsType[T]>] extends [never] ? never : T) : never;

export type OptionalConfigDialogNames<T extends DialogComponentNames = DialogComponentNames> =
	T extends T ? ([RequiredKeys<RestDialogPropsType[T]>] extends [never] ? T : never) : never;

export type DialogNameTuple<T extends DialogComponentNames = DialogComponentNames> = T extends T
	? [T, RestDialogPropsType[T]]
	: never;

export type DialogComponentTuple<T extends DialogComponentNames = DialogComponentNames> =
	T extends T ? [DialogComponentTypeMap[T], Parameters<DialogComponentTypeMap[T]>[0]] : never;
