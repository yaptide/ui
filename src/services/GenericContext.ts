import { createContext, ReactNode, useContext } from 'react';

export type GenericContextProviderProps<T = {}> = {
	children?: ReactNode;
} & T;

export const createGenericContext = <T extends unknown>() => {
	// Create a context with a generic parameter or undefined
	const genericContext = createContext<T | undefined>(undefined);

	// Check if the value provided to the context is defined or throw an error
	const useGenericContext = () => {
		const contextIsDefined = useContext(genericContext);

		if (!contextIsDefined) {
			throw new Error('useGenericContext must be used within a Provider');
		}

		return contextIsDefined;
	};

	return [useGenericContext, genericContext.Provider] as const;
};

export const createSubstituteContext = <T extends unknown>(useSubstituted: () => T) => {
	// Create a context with a generic parameter or undefined
	const genericContext = createContext<T | undefined>(undefined);

	// Check if the value provided to the context is defined or call the substitute
	const useSubstituteOrGenericContext = () => {
		const contextIsDefined = useContext(genericContext);

		try {
			return useSubstituted();
		} catch (e) {
			if (!contextIsDefined) {
				throw new Error('useSubstituteOrGenericContext must be used within a Provider');
			}

			return contextIsDefined;
		}
	};

	return [useSubstituteOrGenericContext, genericContext.Provider] as const;
};
