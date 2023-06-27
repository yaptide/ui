import { useCallback, useEffect, useState } from 'react';

import { LoadFileDialog } from '../ThreeEditor/components/Dialog/LoadFileDialog';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { JSON_VERSION } from '../ThreeEditor/js/YaptideEditor';
import { hasFields } from '../util/customGuards';
import { useDialog } from './DialogService';
import { createGenericContext, GenericContextProviderProps } from './GenericContext';
import { FullSimulationData } from './ShSimulatorService';
import { useStore } from './StoreService';

export interface LoaderContext {
	loadFromFiles: (files: FileList | undefined) => void;
	loadFromUrl: (url: string) => void;
	loadFromJson: (raw_json: object | null) => void;
	loadFromJsonString: (json_string: string) => void;
}
const [useLoader, LoaderContextProvider] = createGenericContext<LoaderContext>();

const isEditorJson = (data: unknown): data is EditorJson => {
	return hasFields(data, 'metadata', 'hash', 'project');
};

export const isFullSimulationData = (data: unknown): data is FullSimulationData => {
	return hasFields(
		data,
		'input',
		'estimators',
		'jobState',
		'jobId',
		'jobTasksStatus',
		'metadata',
		'startTime'
	);
};

const readFile = (file: File) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => resolve(reader.result));
		reader.addEventListener('error', reject);
		reader.readAsText(file);
	});
};

const Loader = ({ children }: GenericContextProviderProps) => {
	const { updateDialogComponent, showDialog, hideDialog } = useDialog();
	const { editorRef, setResultsSimulationData, setLocalResultsSimulationData } = useStore();
	const [, setUrlInPath] = useState<string>();

	const handleJSON = useCallback(
		(json: EditorJson) => {
			if (!editorRef.current) return;
			const type = json.metadata.type;
			switch (type) {
				case 'Editor':
					updateDialogComponent(
						'loadFile',
						editorRef.current && (
							<LoadFileDialog
								editor={editorRef.current}
								data={json}
								onClose={() => hideDialog('loadFile')}
								validVersion={json.metadata.version === JSON_VERSION}
							/>
						)
					);
					showDialog('loadFile');
					break;
				default:
					console.error('Unknown JSON type', type);
					break;
			}
		},
		[editorRef, hideDialog, showDialog, updateDialogComponent]
	);

	const loadData = useCallback(
		(dataArray: unknown[]) => {
			const loadedResults = dataArray.filter(isFullSimulationData);
			if (loadedResults.length === 0) console.info('No results data found in loaded data');
			setLocalResultsSimulationData(prev => {
				const result: FullSimulationData[] = prev.concat(loadedResults);
				return result;
			});
			setResultsSimulationData([...loadedResults].pop());
			const loadedEditor = dataArray
				.concat(loadedResults.map(e => e.input.inputJson))
				.find(isEditorJson);
			if (loadedEditor && editorRef.current) {
				handleJSON(loadedEditor);
			}
		},
		[editorRef, handleJSON, setLocalResultsSimulationData, setResultsSimulationData]
	);

	const loadFromFiles = useCallback(
		(files: FileList | undefined) => {
			if (!files) return;
			const promises = [];
			for (const file of Array.from(files)) {
				promises.push(readFile(file));
			}
			Promise.all(promises).then(results => {
				const dataArray = results.map(result => JSON.parse(result as string));
				loadData(dataArray);
			});
		},
		[loadData]
	);

	const loadFromJson = useCallback(
		(rawJson: object | null) => {
			if (Array.isArray(rawJson)) {
				loadData(rawJson);
			} else {
				loadData([rawJson]);
			}
		},
		[loadData]
	);

	const loadFromUrl = useCallback(
		(url: string) => {
			fetch(url)
				.then(response => {
					if (response.ok) return response.json();
					else return Promise.reject(response);
				})
				.then(response =>
					typeof response === 'object' ? loadFromJson(response) : Promise.reject(response)
				)
				.catch(error => {
					console.error(error);
				});
		},
		[loadFromJson]
	);

	const loadFromJsonString = useCallback(
		(json_string: string) => {
			const json = JSON.parse(json_string);
			if (typeof json === 'object') loadFromJson(json);
		},
		[loadFromJson]
	);

	useEffect(() => {
		if (editorRef.current) {
			const path = window.location.href.split('?')[1];
			setUrlInPath(prev => {
				if (!path || path === prev) return prev;
				loadFromUrl(path);
				return path;
			});
		}
	}, [editorRef, loadFromUrl]);

	const value: LoaderContext = {
		loadFromFiles,
		loadFromUrl,
		loadFromJson,
		loadFromJsonString
	};

	return <LoaderContextProvider value={value}>{children}</LoaderContextProvider>;
};

export { Loader, readFile, useLoader };
