import Box from '@mui/material/Box';
import { SyntheticEvent, useEffect, useState } from 'react';

import { useConfig } from '../config/ConfigService';
import { useAuth } from '../services/AuthService';
import { useLoader } from '../services/DataLoaderService';
import { JsRootService } from '../services/JsRootService';
import { useStore } from '../services/StoreService';
import SceneEditor from '../ThreeEditor/components/Editor/SceneEditor';
import { YaptideEditor } from '../ThreeEditor/js/YaptideEditor';
import { SimulatorType } from '../types/RequestTypes';
import { currentJobStatusData, SimulationInputFiles, StatusState } from '../types/ResponseTypes';
import InputEditorPanel from './components/InputEditor/InputEditorPanel';
import NavDrawer from './components/NavDrawer/NavDrawer';
import { AboutPanel } from './components/Panels/AboutPanel';
import LoginPanel from './components/Panels/LoginPanel';
import { TabPanel } from './components/Panels/TabPanel';
import ResultsPanel from './components/Results/ResultsPanel';
import SimulationPanel from './components/Simulation/SimulationPanel';

function WrapperApp() {
	const { demoMode } = useConfig();
	const { editorRef, resultsSimulationData, setResultsSimulationData } = useStore();
	const { editorProvider, resultsProvider, canLoadEditorData, clearLoadedEditor } = useLoader();
	const { isAuthorized, logout } = useAuth();
	const [open, setOpen] = useState(true);
	const [tabsValue, setTabsValue] = useState('editor');

	const [providedInputFiles, setProvidedInputFiles] = useState<SimulationInputFiles>();
	const [currentSimulator, setCurrentSimulator] = useState<SimulatorType>(
		SimulatorType.SHIELDHIT
	);
	useEffect(() => {
		if (providedInputFiles && tabsValue !== 'simulations') setProvidedInputFiles(undefined);
	}, [providedInputFiles, tabsValue]);

	useEffect(() => {
		if (editorRef.current && canLoadEditorData) {
			clearLoadedEditor();
			setTabsValue('editor');
			for (const data of editorProvider) editorRef.current.loader.loadJSON(data);
			//TODO: #1089 rewrite to support our versioning and types of data. Default loader is now mostly useless
		}
	}, [canLoadEditorData, editorRef, editorProvider, clearLoadedEditor]);

	const handleChange = (event: SyntheticEvent, newValue: string) => {
		if (newValue === 'login' && isAuthorized) logout();
		setTabsValue(newValue);
	};

	useEffect(() => {
		if (resultsProvider.length > 0) {
			setResultsSimulationData(
				resultsProvider.reverse().find(currentJobStatusData[StatusState.COMPLETED])
			);
			setTabsValue('editor');
		}
	}, [resultsProvider, setResultsSimulationData]);

	useEffect(() => {
		if (!isAuthorized && !demoMode) setTabsValue('login');
		else setTabsValue('editor');
	}, [demoMode, isAuthorized]);

	useEffect(() => {
		if (resultsSimulationData)
			setTabsValue(prev => (prev === 'simulations' ? 'results' : prev)); // switch tab to 'results' if user is on 'simulations' tab
	}, [resultsSimulationData]);

	useEffect(() => {
		if (isAuthorized && tabsValue === 'login') setTabsValue('editor');
	}, [isAuthorized, tabsValue]);

	const onEditorInitialized = (editor: YaptideEditor) => {
		editorRef.current = editor;
	};

	return (
		<Box
			sx={{
				width: '100%',
				height: '100vh',
				display: 'flex',
				flexDirection: 'row'
			}}>
			<NavDrawer
				handleChange={handleChange}
				tabsValue={tabsValue}
				open={open}
				setOpen={setOpen}
			/>
			<TabPanel
				value={tabsValue}
				index={'editor'}
				persistent>
				<SceneEditor
					onEditorInitialized={onEditorInitialized}
					sidebarProps={[open, tabsValue === 'editor']}
					focus={tabsValue === 'editor'}
				/>
			</TabPanel>

			<TabPanel
				value={tabsValue}
				index={'inputFiles'}
				persistentIfVisited>
				<InputEditorPanel
					goToRun={(simulator: SimulatorType, inputFiles?: SimulationInputFiles) => {
						setProvidedInputFiles(inputFiles);
						setCurrentSimulator(simulator);
						setTabsValue('simulations');
					}}
				/>
			</TabPanel>

			<TabPanel
				value={tabsValue}
				index={'simulations'}>
				<SimulationPanel
					goToResults={() => setTabsValue('results')}
					forwardedInputFiles={providedInputFiles}
					forwardedSimulator={currentSimulator}
				/>
			</TabPanel>

			<TabPanel
				value={tabsValue}
				index={'results'}
				persistent>
				<JsRootService>
					<ResultsPanel />
				</JsRootService>
			</TabPanel>

			<TabPanel
				value={tabsValue}
				index={'about'}
				persistentIfVisited>
				<AboutPanel />
			</TabPanel>
			<TabPanel
				value={tabsValue}
				index={'login'}>
				<LoginPanel />
			</TabPanel>
		</Box>
	);
}
export default WrapperApp;
