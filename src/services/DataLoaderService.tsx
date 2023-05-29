import { ReactNode, useCallback, useState } from 'react';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { createGenericContext } from './GenericContext';
import { FullSimulationData } from './ShSimulatorService';

export interface ILoader {
	editorProvider: EditorJson[];
	resultsProvider: FullSimulationData[];
	canLoadEditorData: boolean;
	canLoadResultsData: boolean;
	clearLoadedEditor: () => void;
	clearLoadedResults: () => void;
	loadFromFiles: (files: FileList | undefined) => void;
	loadFromUrl: (url: string) => void;
	loadFromJson: (raw_json: object | null) => void;
	loadFromJsonString: (json_string: string) => void;
}
const [useLoader, LoaderContextProvider] = createGenericContext<ILoader>();

const isEditorJson = (data: unknown): data is EditorJson => {
	return (data as EditorJson)?.metadata?.type === 'Editor';
};

const isFullSimulationData = (data: unknown): data is FullSimulationData => {
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
	const [canLoadEditorData, setCanLoadEditorData] = useState<boolean>(false);
	const [canLoadResultsData, setCanLoadResultsData] = useState<boolean>(false);

	const [editorProvider, setEditorProvider] = useState<EditorJson[]>([]);
	const [resultsProvider, setResultsProvider] = useState<FullSimulationData[]>([]);

	const clearLoadedEditor = useCallback(() => {
		setCanLoadEditorData(false);
		setEditorProvider([]);
	}, []);

	const clearLoadedResults = useCallback(() => {
		setCanLoadResultsData(false);
		setResultsProvider([]);
	}, []);

	const loadData = useCallback((dataArray: unknown[]) => {
		if (Array.isArray(dataArray)) {
			setResultsProvider(prev => {
				const result: FullSimulationData[] = prev.concat(
					dataArray.filter(isFullSimulationData)
				);

				if (result.length === 0) console.warn('No results data found in loaded data');

				setCanLoadResultsData(result.length > 0);
				return result;
			});

			setEditorProvider(prev => {
				const result = prev.concat(dataArray.filter(isEditorJson)).concat(
					dataArray
						.filter(isFullSimulationData)
						.map(data => data.input.inputJson)
						.filter(isEditorJson)
				);

				if (result.length === 0) console.warn('No editor data found in loaded data');

				setCanLoadEditorData(result.length > 0);
				return result;
			});
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
		editorProvider,
		resultsProvider,
		canLoadEditorData,
		canLoadResultsData,
		clearLoadedEditor,
		clearLoadedResults,
		loadFromFiles,
		loadFromUrl,
		loadFromJson,
		loadFromJsonString
	};

	return <LoaderContextProvider value={value}>{props.children}</LoaderContextProvider>;
};

export { Loader, readFile, useLoader };
