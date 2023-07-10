import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import * as THREE from 'three';

import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { YaptideEditor } from '../ThreeEditor/js/YaptideEditor';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';
import { FullSimulationData } from './ShSimulatorService';

export interface StoreContext {
	yaptideEditor?: YaptideEditor;
	initializeEditor: (container: HTMLDivElement) => void;
	trackedId?: string;
	setTrackedId: Dispatch<SetStateAction<string | undefined>>;
	resultsSimulationData?: FullSimulationData;
	setResultsSimulationData: Dispatch<SetStateAction<FullSimulationData | undefined>>;
	localResultsSimulationData?: FullSimulationData[];
	setLocalResultsSimulationData: Dispatch<SetStateAction<FullSimulationData[]>>;
}

const [useStore, StoreContextProvider] = createGenericContext<StoreContext>();

declare global {
	interface Window {
		YAPTIDE_EDITOR: YaptideEditor;
	}
}

const Store = ({ children }: GenericContextProviderProps) => {
	const [editor, setEditor] = useState<YaptideEditor>();
	const [resultsSimulationData, setResultsSimulationData] = useState<FullSimulationData>();
	const [localResultsSimulationData, setLocalResultsSimulationData] = useState<
		FullSimulationData[]
	>([]);
	const [trackedId, setTrackedId] = useState<string>();

	const initializeEditor: (container: HTMLDivElement) => void = useCallback(container => {
		const editor = new YaptideEditor(container);

		//TODO: investigate those parameters, remove if not needed and find a better place to initialize the renderer
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.shadowMap.type = 1;
		renderer.toneMapping = 0;
		renderer.toneMappingExposure = 1;

		editor.signals.rendererCreated.dispatch(renderer);
		editor.signals.rendererUpdated.dispatch();

		editor.storage.init(() => {
			const { signals } = editor;

			editor.storage.get((state?: EditorJson) => {
				if (typeof state !== 'undefined') {
					let versionIsOk = true;

					if (state.metadata.version !== editor.jsonVersion) {
						versionIsOk = window.confirm(
							`Editor in memory has version of JSON: ${state.metadata.version}\nCurrent version of editor JSON: ${editor.jsonVersion}\nLoad it anyway?`
						);
					}

					if (versionIsOk) editor.fromJSON(state);
				}

				const selected = editor.config.getKey('selected');

				if (typeof selected !== 'undefined') {
					editor.selectByUuid(selected);
				}
			});

			//

			let timeout: NodeJS.Timeout;

			function saveState() {
				if (editor.config.getKey('autosave') === false) {
					return;
				}

				clearTimeout(timeout);

				timeout = setTimeout(() => {
					editor.signals.savingStarted.dispatch();

					timeout = setTimeout(() => {
						editor.storage.set(editor.toJSON());

						editor.signals.savingFinished.dispatch();
					}, 100);
				}, 1000);
			}

			const stateChangedSignals = [
				signals.geometryChanged,
				signals.objectAdded,
				signals.objectChanged,
				signals.objectRemoved,
				signals.materialChanged,
				signals.sceneBackgroundChanged,
				signals.sceneEnvironmentChanged,
				signals.sceneGraphChanged,
				signals.historyChanged,
				signals.detectFilterChanged,
				signals.scoringQuantityChanged,
				signals.projectChanged
			];
			stateChangedSignals.forEach(signal => signal.add(saveState));
		});

		setEditor(editor);
		window.YAPTIDE_EDITOR = editor;
	}, []);

	const value: StoreContext = {
		yaptideEditor: editor,
		initializeEditor,
		trackedId,
		setTrackedId,
		resultsSimulationData,
		setResultsSimulationData,
		localResultsSimulationData,
		setLocalResultsSimulationData
	};

	return <StoreContextProvider value={value}>{children}</StoreContextProvider>;
};

export { Store, useStore };
