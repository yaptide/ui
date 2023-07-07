import { DialogComponentTypeMap } from '../services/DialogService';
import { ConcreteDialogProps } from '../ThreeEditor/components/Dialog/CustomDialog';
import { RequiredKeys } from './TypeTransformUtil';

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

export type ValidComponentTypes<T extends [string, ValidArgumentsType<T[1]>]> = T;

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
