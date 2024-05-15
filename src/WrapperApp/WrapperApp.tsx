import Box from '@mui/material/Box';
import { SyntheticEvent, useEffect, useState } from 'react';

import { useConfig } from '../config/ConfigService';
import { useAuth } from '../services/AuthService';
import { useStore } from '../services/StoreService';
import SceneEditor from '../ThreeEditor/components/Editor/SceneEditor';
import { SimulatorType } from '../types/RequestTypes';
import { SimulationInputFiles } from '../types/ResponseTypes';
import InputEditorPanel from './components/InputEditor/InputEditorPanel';
import NavDrawer from './components/NavDrawer/NavDrawer';
import { AboutPanel } from './components/Panels/AboutPanel';
import LoginPanel from './components/Panels/LoginPanel';
import { TabPanel } from './components/Panels/TabPanel';
import ResultsPanel from './components/Results/ResultsPanel';
import SimulationPanel from './components/Simulation/SimulationPanel';
import {camelCaseToNormalText} from '../util/camelCaseToSentenceCase'

function WrapperApp() {
	const { demoMode } = useConfig();
	const { resultsSimulationData } = useStore();
	const { isAuthorized, logout } = useAuth();
	const [open, setOpen] = useState(true);
	const [tabsValue, setTabsValue] = useState('editor');

	const [providedInputFiles, setProvidedInputFiles] = useState<SimulationInputFiles>();
	const [currentSimulator, setCurrentSimulator] = useState<SimulatorType>(SimulatorType.COMMON);

	useEffect(() => {
		if (providedInputFiles && tabsValue !== 'simulations') setProvidedInputFiles(undefined);
	}, [providedInputFiles, tabsValue]);

	const handleChange = (event: SyntheticEvent, newValue: string) => {
		if (newValue === 'login' && isAuthorized) logout();
		setTabsValue(newValue);
	};

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

	useEffect(() => {
		//The document.title is used by web browser to display a name on the browser tab. 
		//There we would like to see the name extracted from a tabsValue, which can sugest user in which tab of our application is at the moment.
		//We want to make the text which be a title as a normal text, not cammel case text, to make it similar to values of tabs user can see on navbar.
		document.title = camelCaseToNormalText(tabsValue); //e.g. we've got 'inputFiles' as a value of tabsValue and this function converts this value to 'Input Files'
	}, [tabsValue]);

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
					sidebarProps={[open, tabsValue === 'editor']}
					focus={tabsValue === 'editor'}
					simulator={currentSimulator}
					onSimulatorChange={setCurrentSimulator}
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
					simulator={currentSimulator}
					onSimulatorChange={setCurrentSimulator}
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
				<ResultsPanel />
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
