import { useMediaQuery } from '@mui/material';
import Box from '@mui/material/Box';
import React, { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { JsRootService } from '../JsRoot/JsRootService';
import { useAuth } from '../services/AuthService';
import { useLoader } from '../services/DataLoaderService';
import { FinalSimulationStatusData } from '../services/ShSimulatorService';
import { useStore } from '../services/StoreService';
import { Editor } from '../ThreeEditor/js/Editor';
import ThreeEditor from '../ThreeEditor/ThreeEditor';
import { DEMO_MODE } from '../util/Config';
import { AboutPanel } from './components/AboutPanel';
import InputEditorPanel from './components/InputEditor/InputEditorPanel';
import LoginPanel from './components/LoginPanel';
import ResultsPanel from './components/Results/ResultsPanel';
import SimulationPanel from './components/Simulation/SimulationPanel';
import SimulationPanelDemo from './components/Simulation/SimulationPanelDemo';
import { TabPanel } from './components/TabPanel';
import YapDrawer from './components/YapDrawer/YapDrawer';

function WrapperApp() {
	const { editorRef, resultsSimulationData, setResultsSimulationData } = useStore();
	const { editorProvider, canLoadEditorData, setLoadedEditor } = useLoader();
	const { isAuthorized, logout } = useAuth();
	const [open, setOpen] = React.useState(false);
	const [tabsValue, setTabsValue] = useState('editor');

	useEffect(() => {
		console.log('WrapperApp: useEffect', editorProvider, editorRef, canLoadEditorData);
		if (editorRef.current && canLoadEditorData) {
			setLoadedEditor();
			setTabsValue('editor');
			for (const data of editorProvider) editorRef.current.loader.loadJSON(data);
		}
	}, [canLoadEditorData, editorRef.current, editorProvider]);

	const handleChange = (event: SyntheticEvent, newValue: string) => {
		setTabsValue(newValue);
	};

	useEffect(() => {
		if (!isAuthorized && !DEMO_MODE) setTabsValue('login');
		else setTabsValue('editor');
	}, [isAuthorized]);

	useEffect(() => {
		if (resultsSimulationData) setTabsValue('results');
	}, [resultsSimulationData]);

	useEffect(() => {
		if (isAuthorized && tabsValue === 'login') logout();
	}, [tabsValue]);

	const onLoadExample = useCallback(
		(example: FinalSimulationStatusData) => {
			if (!DEMO_MODE) return;
			setResultsSimulationData(example);
			setTabsValue('editor');
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
				{!DEMO_MODE ? (
					<SimulationPanel goToResults={() => setTabsValue('results')} />
				) : (
					<SimulationPanelDemo goToResults={() => setTabsValue('results')} />
				)}
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
