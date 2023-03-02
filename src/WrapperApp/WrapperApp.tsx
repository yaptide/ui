import Box from '@mui/material/Box';
import React, { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { JsRootService } from '../JsRoot/JsRootService';
import { useAuth } from '../services/AuthService';
import { useLoader } from '../services/DataLoaderService';
import { useStore } from '../services/StoreService';
import { Editor } from '../ThreeEditor/js/Editor';
import ThreeEditor from '../ThreeEditor/ThreeEditor';
import { DEMO_MODE } from '../util/Config';
import { AboutPanel } from './components/AboutPanel';
import InputEditorPanel from './components/InputEditor/InputEditorPanel';
import LoginPanel from './components/LoginPanel';
import ResultsPanel from './components/Results/ResultsPanel';
import SimulationPanel from './components/Simulation/SimulationPanel';
import { TabPanel } from './components/TabPanel';
import YapDrawer from './components/YapDrawer/YapDrawer';
import { JobStatusData, currentJobStatusData, StatusState } from '../services/ResponseTypes';

function WrapperApp() {
	const { editorRef, resultsSimulationData, setResultsSimulationData } = useStore();
	const { editorProvider, resultsProvider, canLoadEditorData, clearLoadedEditor } = useLoader();
	const { isAuthorized, logout } = useAuth();
	const [open, setOpen] = useState(false);
	const [tabsValue, setTabsValue] = useState('editor');

	useEffect(() => {
		if (editorRef.current && canLoadEditorData) {
			clearLoadedEditor();
			setTabsValue('editor');
			for (const data of editorProvider) editorRef.current.loader.loadJSON(data);
		}
	}, [canLoadEditorData, editorRef, editorProvider, clearLoadedEditor]);

	const handleChange = (event: SyntheticEvent, newValue: string) => {
		if (newValue === 'login' && isAuthorized) logout();
		setTabsValue(newValue);
	};

	useEffect(() => {
		if (resultsProvider.length > 0) {
			setResultsSimulationData(resultsProvider[resultsProvider.length - 1]);
			setTabsValue('editor');
		}
	}, [resultsProvider, setResultsSimulationData]);

	useEffect(() => {
		if (!isAuthorized && !DEMO_MODE) setTabsValue('login');
		else setTabsValue('editor');
	}, [isAuthorized]);

	useEffect(() => {
		if (resultsSimulationData)
			setTabsValue(prev => (prev === 'simulations' ? 'results' : prev)); // switch tab to 'results' if user is on 'simulations' tab
	}, [resultsSimulationData]);

	useEffect(() => {
		if (isAuthorized && tabsValue === 'login') setTabsValue('editor');
	}, [isAuthorized, tabsValue]);

	const onLoadExample = useCallback(
		(example: JobStatusData) => {
			if (!DEMO_MODE) return;
			if (currentJobStatusData[StatusState.COMPLETED](example)) {
				setResultsSimulationData(example);
				setTabsValue('editor');
			}
		},
		[setResultsSimulationData]
	);

	const onEditorInitialized = (editor: Editor) => {
		editorRef.current?.signals.exampleLoaded.remove(onLoadExample);
		editorRef.current = editor;
		editorRef.current?.signals.exampleLoaded.add(onLoadExample);
	};

	useEffect(() => {
		editorRef.current?.signals.exampleLoaded.add(onLoadExample);
		return () => {
			editorRef.current?.signals.exampleLoaded.remove(onLoadExample);
		};
	}, [editorRef, onLoadExample]);

	return (
		<Box
			sx={{
				width: '100%',
				height: '100vh',
				display: 'flex',
				flexDirection: 'row'
			}}>
			<YapDrawer
				handleChange={handleChange}
				tabsValue={tabsValue}
				open={open}
				setOpen={setOpen}
			/>
			<TabPanel value={tabsValue} index={'editor'} persistent>
				<ThreeEditor
					onEditorInitialized={onEditorInitialized}
					sidebarProps={[open, tabsValue === 'editor']}
					focus={tabsValue === 'editor'}
				/>
			</TabPanel>

			<TabPanel value={tabsValue} index={'inputFiles'} persistentIfVisited>
				<InputEditorPanel goToRun={() => setTabsValue('simulations')} />
			</TabPanel>

			<TabPanel value={tabsValue} index={'simulations'}>
				<SimulationPanel goToResults={() => setTabsValue('results')} />
			</TabPanel>

			<TabPanel value={tabsValue} index={'results'} persistent>
				<JsRootService>
					<ResultsPanel />
				</JsRootService>
			</TabPanel>

			<TabPanel value={tabsValue} index={'about'} persistentIfVisited>
				<AboutPanel />
			</TabPanel>
			<TabPanel value={tabsValue} index={'login'}>
				<LoginPanel />
			</TabPanel>
		</Box>
	);
}
export default WrapperApp;
