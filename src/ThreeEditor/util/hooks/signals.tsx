import { useCallback, useEffect, useRef, useState } from 'react';
import { Object3D } from 'three';
import { Editor } from '../../js/Editor';

type SignalType = keyof Editor['signals'];

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

/**
 * Type checked if it does not have `object` property
 */
type ValidProxyState<T> = T extends { object: any } ? never : T;

/**
 * Object wrapped in `Proxy`, that holds original object under `object` property.
 */
export type ProxyState<T> = T & {
	object: T;
};

/**
 * Warning: This hook return a new Proxy object with a different reference than the original one.
 *
 * This hook is used to watch the editor state and return the state.
 * It is used to avoid unnecessary re-rendering of components.
 * It gathers accessed properties and watches them.
 * This hook doesn't allow subscription to a multi-level object states.
 * ```ts
 * object.prop1 // prop1 will be watched
 * object.prop2.prop3 //prop3 won't be watched
 * ```
 * @param editor The editor instance
 * @param watchedObject The object to watch
 * @returns The state of the watched object wrapped in Proxy
 */
function useSmartWatchEditorState<T>(
	editor: Editor,
	watchedObject: ValidProxyState<NonNullable<T>>,
	watchAnyChange?: boolean,
	debug?: boolean
): { state: ProxyState<T> };
function useSmartWatchEditorState<T>(
	editor: Editor,
	watchedObject: ValidProxyState<NonNullable<T>> | null,
	watchAnyChange?: boolean,
	debug?: boolean
): { state: ProxyState<T> | null };
function useSmartWatchEditorState<T>(
	editor: Editor,
	watchedObject: ValidProxyState<T> | null,
	watchAnyChange = false,
	debug = false
): { state: unknown } {
	const watchedPropertyArrRef = useRef<Set<string>>(new Set());

	const createProxy = useCallback(
		() =>
			new Proxy(watchedObject ?? {}, {
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

	const [state, setState] = useState({ state: watchedObject ? proxyObjectRef.current : null });

	useEffect(() => {
		watchedPropertyArrRef.current = new Set();
		proxyObjectRef.current = createProxy();
		setState({ state: watchedObject ? proxyObjectRef.current : null });

		const callback = (object: any, property?: string) => {
			if (object === watchedObject) {
				if (debug) console.log(watchedPropertyArrRef.current, property);
				if (watchAnyChange) setState({ state: proxyObjectRef.current });
				else if (property && watchedPropertyArrRef.current.has(property)) {
					console.log('update', property, object[property]);
					setState({ state: proxyObjectRef.current });
				}
			}
		};

		editor.signals.objectChanged.add(callback);
		return () => {
			editor.signals.objectChanged.remove(callback);
		};
	}, [createProxy, debug, editor.signals.objectChanged, watchAnyChange, watchedObject]);

	return state as { state: ProxyState<T> };
}

export { useSmartWatchEditorState };
