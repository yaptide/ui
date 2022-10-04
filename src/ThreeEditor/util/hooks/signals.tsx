import { useEffect, useState } from 'react';
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

function useReadEditorState<T>(editor: Editor, watchedObject: T): { state: T };
function useReadEditorState<T, K extends keyof T>(
	editor: Editor,
	watchedObject: T,
	objectProperty?: K
): { state: T[K] | undefined };

function useReadEditorState<T, K extends keyof T>(
	editor: Editor,
	watchedObject: T,
	objectProperty?: K
): unknown {
	const [state, setState] = useState(() => {
		return {
			state: objectProperty ? watchedObject[objectProperty] : watchedObject
		};
	});

	useEffect(() => {
		setState({
			state: objectProperty ? watchedObject[objectProperty] : watchedObject
		});

		const callback = (object: unknown, property?: string) => {
			if (object === watchedObject) {
				if (!objectProperty) setState({ state: watchedObject });
				else if (property === objectProperty)
					setState({ state: watchedObject[objectProperty] });
			}
		};

		editor.signals.objectChanged.add(callback);
		return () => {
			editor.signals.objectChanged.remove(callback);
		};
	}, [editor, watchedObject, objectProperty]);

	return state;
}

export { useReadEditorState };
