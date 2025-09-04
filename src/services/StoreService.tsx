import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import * as THREE from 'three';

import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { YaptideEditor } from '../ThreeEditor/js/YaptideEditor';
import { SimulatorType } from '../types/RequestTypes';
import { SimulationInfo } from '../types/ResponseTypes';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';
import { FullSimulationData } from './ShSimulatorService';

export interface DataWithSource<S extends string, T> {
	source: S;
	data: T;
}

// This helps us to decide whether to jump to Results page abruptly
// when user manually select simulations (= onSelect),
// or not, when simulation was loaded / finished in the background (= onRunFinish / onLoad)
export type ResultsSimulationDataWithSource = DataWithSource<
	'onSelect' | 'onRunFinish' | 'onLoad',
	FullSimulationData
>;

export interface StoreContext {
	yaptideEditor?: YaptideEditor;
	setSimulatorType: (simulator: SimulatorType, changingToOrFromGeant4: boolean) => void;
	initializeEditor: (container: HTMLDivElement) => void;
	trackedId?: string;
	setTrackedId: Dispatch<SetStateAction<string | undefined>>;
	resultsSimulationData?: ResultsSimulationDataWithSource;
	setResultsSimulationData: Dispatch<SetStateAction<ResultsSimulationDataWithSource | undefined>>;
	localResultsSimulationData?: FullSimulationData[];
	setLocalResultsSimulationData: Dispatch<SetStateAction<FullSimulationData[]>>;
	simulationJobIdsSubmittedInSession: string[];
	setSimulationJobIdsSubmittedInSession: Dispatch<SetStateAction<string[]>>;
}

const [useStore, StoreContextProvider] = createGenericContext<StoreContext>();

declare global {
	interface Window {
		YAPTIDE_EDITOR: YaptideEditor;
	}
}

const Store = ({ children }: GenericContextProviderProps) => {
	const [editor, setEditor] = useState<YaptideEditor>();
	const [resultsSimulationData, setResultsSimulationData] =
		useState<ResultsSimulationDataWithSource>();

	const [localResultsSimulationData, setLocalResultsSimulationData] = useState<
		FullSimulationData[]
	>([]);

	const [simulationJobIdsSubmittedInSession, setSimulationJobIdsSubmittedInSession] = useState<
		string[]
	>([]);
	const [trackedId, setTrackedId] = useState<string>();

	// helper function to set simulator type so the whole app sees it
	const setSimulatorType = useCallback(
		(simulator: SimulatorType, changingToOrFromGeant4: boolean) => {
			if (!editor) {
				return;
			}

			editor.contextManager.currentSimulator = simulator;

			if (changingToOrFromGeant4) {
				editor.clear();
			}

			// currentSimulator field is deeply nested within YaptideEditor
			//
			// to update all components which use the property via const { yaptideEditor } = useStore()
			// we need to change the reference of the whole object for react to see that we changed the property
			//
			// since important methods are defined by setting YaptideEditor.prototype = { ... }
			// we can't simply do setEditor({ ...editor }) because it doesn't copy any methods and the app breaks
			let newEditor = Object.create(Object.getPrototypeOf(editor));
			Object.defineProperties(newEditor, Object.getOwnPropertyDescriptors(editor));
			setEditor(newEditor);
		},
		[editor]
	);

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

					if (versionIsOk) editor.fromSerialized(state);
				}

				const selected = editor.config.getKey('selected');

				if (typeof selected !== 'undefined') {
					editor.selectByUuid(selected);
				}
			});

			let timeout: NodeJS.Timeout;

			function saveState() {
				if (editor.config.getKey('autosave') === false) {
					return;
				}

				clearTimeout(timeout);

				timeout = setTimeout(() => {
					editor.signals.savingStarted.dispatch();

					timeout = setTimeout(() => {
						editor.storage.set(editor.toSerialized());

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
		setSimulatorType,
		initializeEditor,
		trackedId,
		setTrackedId,
		resultsSimulationData,
		setResultsSimulationData,
		localResultsSimulationData,
		setLocalResultsSimulationData,
		simulationJobIdsSubmittedInSession,
		setSimulationJobIdsSubmittedInSession
	};

	return <StoreContextProvider value={value}>{children}</StoreContextProvider>;
};

export { Store, useStore };
