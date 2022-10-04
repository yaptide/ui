import { useEffect } from 'react';
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
			signalArray.forEach(signal => editor.signals[signal].add(callback));
		};
	}, [callback, editor.signals, signal]);
};
