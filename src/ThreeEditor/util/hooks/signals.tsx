import { useCallback, useEffect, useRef, useState } from 'react';
import { Object3D } from 'three';
import { Editor } from '../../js/Editor';

type SignalType = keyof Editor['signals'];

export const useSignalObjectChanged = (
	editor: Editor,
	callback: (object: Object3D, property: keyof Object3D) => void
) => {
	useSignal(editor, 'objectChanged', callback);
};

export const useSignal = (
	editor: Editor,
	signal: SignalType | SignalType[],
	callback: (object: Object3D, ...args: any[]) => void
) => {
	useEffect(() => {
		let signalArray = Array.isArray(signal) ? signal : [signal];
		signalArray.forEach(signal => editor.signals[signal].add(callback));
		return () => {
			signalArray.forEach(signal => editor.signals[signal].remove(callback));
		};
	}, [callback, editor.signals, signal]);
};

// function useReadEditorState<T, K extends keyof T>(
// 	editor: Editor,
// 	watchedObject: unknown,
// 	options?: { watchedProperty?: K[]; typeGuard: (value: unknown) => value is T }
// ): Readonly<{ state: DeepReadonly<T> | UndefinedProperties<DeepReadonly<T>> }>;
// function useReadEditorState<T, K extends keyof T>(
// 	editor: Editor,
// 	watchedObject: unknown,
// 	options: { watchedProperty: K; typeGuard: (value: unknown) => value is T }
// ): Readonly<{ state: DeepReadonly<T[K]> | undefined }>;
// function useReadEditorState<T, K extends keyof T>(
// 	editor: Editor,
// 	watchedObject: T,
// 	options?: { watchedProperty?: K[] }
// ): Readonly<{ state: DeepReadonly<T> }>;
// function useReadEditorState<T, K extends keyof T>(
// 	editor: Editor,
// 	watchedObject: T,
// 	options: { watchedProperty: K }
// ): Readonly<{ state: DeepReadonly<T[K]> }>;

// function useReadEditorState<T, K extends keyof T>(
// 	editor: Editor,
// 	watchedObject: T,
// 	options?: { watchedProperty?: K | K[]; typeGuard?: (value: unknown) => value is T }
// ): unknown {
// 	const { current: { watchedProperty = undefined, typeGuard = undefined } = {} } =
// 		useRef(options);

// 	const { current: emptyRef } = useRef({ state: undefined });

// 	const initState = useCallback(() => {
// 		if (typeGuard && typeGuard(watchedObject)) return emptyRef;

// 		if (!watchedProperty) return { state: watchedObject };

// 		if (Array.isArray(watchedProperty)) return { state: watchedObject };

// 		return { state: watchedObject[watchedProperty] };
// 	}, [emptyRef, typeGuard, watchedObject, watchedProperty]);

// 	const [state, setState] = useState(initState());

// 	useEffect(() => {
// 		setState(initState());

// 		const callback = (object: any, property?: string) => {
// 			if (object === watchedObject) {
// 				if (typeGuard && !typeGuard(watchedObject)) return setState(emptyRef);

// 				if (!watchedProperty) setState({ state: watchedObject });
// 				else if (Array.isArray(watchedProperty)) {
// 					if (watchedProperty.includes(property as K)) setState({ state: watchedObject });
// 				} else if (property === watchedProperty)
// 					setState({ state: watchedObject[watchedProperty] });
// 			}
// 		};

// 		editor.signals.objectChanged.add(callback);
// 		return () => {
// 			editor.signals.objectChanged.remove(callback);
// 		};
// 	}, [
// 		editor.signals.objectChanged,
// 		emptyRef,
// 		initState,
// 		typeGuard,
// 		watchedObject,
// 		watchedProperty
// 	]);

// 	return state;
// }
// function useWatchEditorState<T>(editor: Editor, watchedObject: T): Readonly<{ state: T }>;

// function useWatchEditorState<T, K extends keyof T>(
// 	editor: Editor,
// 	watchedObject: T,
// 	onlyWatchProperties: K[]
// ): Readonly<{ state: T }>;

// function useWatchEditorState<T, K extends keyof T>(
// 	editor: Editor,
// 	watchedObject: T,
// 	onlyWatchProperties?: K[]
// ): unknown {
// 	const { current: watchedPropertyArr } = useRef(onlyWatchProperties);

// 	const [state, setState] = useState({ state: watchedObject });

// 	useEffect(() => {
// 		setState({ state: watchedObject });

// 		const callback = (object: any, property?: string) => {
// 			if (object === watchedObject) {
// 				if (!watchedPropertyArr) setState({ state: watchedObject });
// 				else if (Array.isArray(watchedPropertyArr))
// 					if (watchedPropertyArr.includes(property as K))
// 						setState({ state: watchedObject });
// 			}
// 		};

// 		editor.signals.objectChanged.add(callback);
// 		return () => {
// 			editor.signals.objectChanged.remove(callback);
// 		};
// 	}, [editor.signals.objectChanged, watchedObject, watchedPropertyArr]);

// 	return state;
// }

type ProxyState<T> = T & {
	object: T;
};

/**
 * Warning: This hook return new Proxy object with different reference than original one.
 *
 * This hook is used to watch the editor state and return the state.
 * It is used to avoid unnecessary re-rendering of components.
 * It gathers all accessed properties and watch them.
 * @param editor The editor instance
 * @param watchedObject The object to watch
 * @returns The state of the watched object wrapped in Proxy
 */
export function useSmartWatchEditorState<T extends Object3D>(
	editor: Editor,
	watchedObject: T,
	debug: boolean = false
): { state: ProxyState<T> } {
	const watchedPropertyArrRef = useRef<Set<string>>(new Set());

	const createProxy = useCallback(
		() =>
			new Proxy(watchedObject, {
				get(target, property) {
					if ('object' === property) return target;
					// gather all properties that are accessed
					watchedPropertyArrRef.current.add(property as string);
					if (debug) console.log(watchedPropertyArrRef.current);
					return Reflect.get(target, property);
				}
			}),
		[debug, watchedObject]
	);

	const proxyObjectRef = useRef(createProxy());

	const [state, setState] = useState({ state: proxyObjectRef.current });

	useEffect(() => {
		watchedPropertyArrRef.current = new Set();
		proxyObjectRef.current = createProxy();
		setState({ state: proxyObjectRef.current });

		const callback = (object: any, property?: string) => {
			if (object === watchedObject) {
				if (debug) console.log(watchedPropertyArrRef.current, property);
				if (property && watchedPropertyArrRef.current.has(property)) {
					console.log('update', property, object[property]);
					setState({ state: proxyObjectRef.current });
				}
			}
		};

		editor.signals.objectChanged.add(callback);
		return () => {
			editor.signals.objectChanged.remove(callback);
		};
	}, [createProxy, debug, editor.signals.objectChanged, watchedObject]);

	return state as { state: ProxyState<T> };
}

// export { useWatchEditorState };
