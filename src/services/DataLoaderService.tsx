import { ReactNode, useCallback, useState } from 'react';
import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { createGenericContext } from '../util/GenericContext';
import { FinalSimulationStatusData } from './ShSimulatorService';

export interface ILoader {
	editorProvider: EditorJson[];
	resultsProvider: FinalSimulationStatusData[];
	canLoadEditorData: boolean;
	canLoadResultsData: boolean;
	clearLoadedEditor: () => void;
	clearLoadedResults: () => void;
	loadFromFiles: (files: FileList | null) => void;
	loadFromUrl: (url: string) => void;
	loadFromJson: (raw_json: {}) => void;
	loadFromJsonString: (json_string: string) => void;
}
const [useLoader, LoaderContextProvider] = createGenericContext<ILoader>();

const isFinalSimulationStatusData = (data: unknown): data is FinalSimulationStatusData => {
	return (data as FinalSimulationStatusData)?.metadata?.type === 'results';
};

const isEditorJson = (data: unknown): data is EditorJson => {
	return (data as EditorJson)?.metadata?.type === 'Editor';
};

const Loader = (props: { children: ReactNode }) => {
	const [canLoadEditorData, setCanLoadEditorData] = useState<boolean>(false);
	const [canLoadResultsData, setCanLoadResultsData] = useState<boolean>(false);

	const [editorProvider, setEditorProvider] = useState<EditorJson[]>([]);
	const [resultsProvider, setResultsProvider] = useState<FinalSimulationStatusData[]>([]);

	const clearLoadedEditor = useCallback(() => {
		setCanLoadEditorData(false);
		setEditorProvider([]);
	}, []);

	const clearLoadedResults = useCallback(() => {
		setCanLoadResultsData(false);
		setResultsProvider([]);
	}, []);

	const loadData = useCallback((dataArray: (EditorJson | FinalSimulationStatusData)[]) => {
		console.log('loadData', dataArray);
		if (Array.isArray(dataArray)) {
			setResultsProvider(prev => {
				const result = prev.concat(dataArray.filter(isFinalSimulationStatusData));
				setCanLoadResultsData(result.length > 0);
				return result;
			});

			setEditorProvider(prev => {
				const result = prev.concat(dataArray.filter(isEditorJson)).concat(
					dataArray
						.filter(isFinalSimulationStatusData)
						.map(data => data.editor)
						.filter(isEditorJson)
				);
				setCanLoadEditorData(result.length > 0);
				return result;
			});
		}
	}, []);

	const readFile = useCallback((file: File) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.addEventListener('load', () => resolve(reader.result));
			reader.addEventListener('error', reject);
			reader.readAsText(file);
		});
	}, []);

	const loadFromFiles = useCallback(
		(files: FileList | null) => {
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
		[loadData, readFile]
	);

	const loadFromJson = useCallback(
		(raw_json: {}) => {
			if (Array.isArray(raw_json)) {
				loadData(raw_json);
			} else {
				loadData([raw_json as EditorJson | FinalSimulationStatusData]);
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
				.then(loadFromJson)
				.catch(error => {
					console.error(error);
				});
		},
		[loadFromJson]
	);

	const loadFromJsonString = useCallback(
		(json_string: string) => {
			const json = JSON.parse(json_string);
			loadFromJson(json);
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

export { useLoader, Loader };
