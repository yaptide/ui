import { ReactNode, useCallback } from 'react';

import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { createGenericContext } from './GenericContext';
import { FullSimulationData } from './ShSimulatorService';
import { useStore } from './StoreService';

export interface ILoader {
	loadFromFiles: (files: FileList | undefined) => void;
	loadFromUrl: (url: string) => void;
	loadFromJson: (raw_json: object | null) => void;
	loadFromJsonString: (json_string: string) => void;
}
const [useLoader, LoaderContextProvider] = createGenericContext<ILoader>();

const isEditorJson = (data: unknown): data is EditorJson => {
	return (data as EditorJson)?.metadata?.type === 'Editor';
};

export const isFullSimulationData = (data: unknown): data is FullSimulationData => {
	const keys: (keyof FullSimulationData)[] = [
		'input',
		'estimators',
		'jobState',
		'jobId',
		'jobTasksStatus',
		'metadata',
		'startTime'
	];
	return keys.every(key => key in (data as any));
};

const readFile = (file: File) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => resolve(reader.result));
		reader.addEventListener('error', reject);
		reader.readAsText(file);
	});
};

const Loader = (props: { children: ReactNode }) => {
	const { editorRef, setResultsSimulationData, setLocalResultsSimulationData } = useStore();

	const loadData = useCallback((dataArray: unknown[]) => {
		if (Array.isArray(dataArray)) {
			const loadedResults = dataArray.filter(isFullSimulationData);
			if (loadedResults.length === 0) console.info('No results data found in loaded data');
			setLocalResultsSimulationData(prev => {
				const result: FullSimulationData[] = prev.concat(loadedResults);
				return result;
			});
			console.log('loadedResults', loadedResults);
			setResultsSimulationData([...loadedResults].pop());
			const loadedEditor = dataArray.find(isEditorJson);
			if (loadedEditor) {
				editorRef.current?.loader.loadJSON(loadedEditor);
				//TODO: #1089 rewrite to support our versioning and types of data. Default loader is now mostly useless
			}
		}
	}, []);

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

	const value: ILoader = {
		loadFromFiles,
		loadFromUrl,
		loadFromJson,
		loadFromJsonString
	};

	return <LoaderContextProvider value={value}>{props.children}</LoaderContextProvider>;
};

export { Loader, readFile, useLoader };
