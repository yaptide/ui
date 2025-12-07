import { useDatasetManager, UseDatasetManagerResult } from '../Geant4Worker/Geant4DatasetManager';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';

const [useSharedDatasetManager, InnerDatasetManagerContextProvider] =
	createGenericContext<UseDatasetManagerResult>();

function Geant4DatasetContextProvider({ children }: GenericContextProviderProps) {
	const datasetManager = useDatasetManager();

	return (
		<InnerDatasetManagerContextProvider value={datasetManager}>
			{children}
		</InnerDatasetManagerContextProvider>
	);
}

export { Geant4DatasetContextProvider, useSharedDatasetManager };
