import { ReactNode, useCallback, useState } from 'react';

import { createGenericContext, GenericContextProviderProps } from './GenericContext';

export interface DialogContext {
	updateDialogComponent: (name: string, component: ReactNode) => void;
	showDialog: (name: string) => void;
	hideDialog: (name?: string) => void;
}
const [useDialog, DialogContextProvider] = createGenericContext<DialogContext>();

const DialogProvider = ({ children }: GenericContextProviderProps) => {
	const [dialogName, setDialogName] = useState<string>();
	const [dialogMap, setDialogMap] = useState<Record<string, ReactNode>>({});

	const updateDialogComponent = useCallback((name: string, component: ReactNode) => {
		setDialogMap(prev => {
			const newMap = { ...prev };
			newMap[name] = component;
			return newMap;
		});
	}, []);

	const showDialog = useCallback((name: string) => {
		setDialogName(name);
	}, []);

	const hideDialog = useCallback((name?: string) => {
		setDialogName(prev => (name && name !== prev ? prev : undefined));
	}, []);

	const value: DialogContext = {
		updateDialogComponent,
		showDialog,
		hideDialog
	};

	return (
		<DialogContextProvider value={value}>
			{dialogName && dialogMap[dialogName]}
			{children}
		</DialogContextProvider>
	);
};

export { DialogProvider, useDialog };
