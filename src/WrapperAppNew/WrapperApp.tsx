import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { SyntheticEvent, useEffect, useState } from 'react';

import { useConfig } from '../config/ConfigService';
import { useAuth } from '../services/AuthService';
import { useStore } from '../services/StoreService';
import { EditorToolbar } from '../ThreeEditor/componentsNew/Editor/EditorToolbar';
import SceneEditor from '../ThreeEditor/componentsNew/Editor/SceneEditor';
import { EditorSidebar } from '../ThreeEditor/componentsNew/Sidebar/EditorSidebar';
import { SimulatorType } from '../types/RequestTypes';
import { SimulationInputFiles } from '../types/ResponseTypes';
import { camelCaseToNormalText } from '../util/camelCaseToSentenceCase';
import HeaderPanel from './components/Header/HeaderPanel';
import InputEditorPanel from './components/InputEditor/InputEditorPanel';
import { NavDrawerContext } from './components/NavPanel/NavDrawerContext';
import NavPanel from './components/NavPanel/NavPanel';
import { AboutPanel } from './components/Panels/AboutPanel';
import { ExamplePanel } from './components/Panels/ExamplePanel';
import LoginPanel from './components/Panels/LoginPanel';
import { TabPanel } from './components/Panels/TabPanel';
import ResultsPanel from './components/Results/ResultsPanel';
import RunningQueue from './components/Simulation/RunningQueue';
import { RunSimulationForm } from './components/Simulation/RunSimulationForm';
import SimulationPanel from './components/Simulation/SimulationPanel';
import { useRunSimulation } from './UseRunSimulation';

const StyledAppGrid = styled(Box)(({ theme }) => ({
	background: theme.palette.background.default,
	display: 'grid',
	width: '100%',
	height: '100vh',
	gridTemplateColumns:
		'[drawer-start] 200px [drawer-end content-start] 1fr [content-end sidebar-start] 370px [sidebar-end]',
	gridTemplateRows: '[header-start] 52px [header-end content-start] auto [content-end]',
	gap: 8,
	padding: 8,
	boxSizing: 'border-box'
}));

function WrapperApp() {
	const { demoMode } = useConfig();
	const { yaptideEditor, resultsSimulationData } = useStore();
	const { isAuthorized, logout } = useAuth();
	const [open, setOpen] = useState(true);
	const [tabsValue, setTabsValue] = useState('editor');

	const [providedInputFiles, setProvidedInputFiles] = useState<SimulationInputFiles>();
	const [currentSimulator, setCurrentSimulator] = useState<SimulatorType>(SimulatorType.COMMON);

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
		//There we would like to see the name extracted from a tabsValue, which can suggest user in which tab of our application is at the moment.
		//We want to make the text which be a title as a normal text, not camel case text, to make it similar to values of tabs user can see on navbar.
		document.title = camelCaseToNormalText(tabsValue); //e.g. we've got 'inputFiles' as a value of tabsValue and this function converts this value to 'Input Files'
	}, [tabsValue]);

	const runSimulation = useRunSimulation();

	return (
		<NavDrawerContext value={tabsValue}>
			<StyledAppGrid>
				<TabPanel
					sx={{
						gridColumn: 'drawer-start / drawer-end',
						gridRow: 'header-start / content-end'
					}}>
					<NavPanel
						handleChange={handleChange}
						tabsValue={tabsValue}
						open={open}
						setOpen={setOpen}
					/>
				</TabPanel>

				{/* Login screen */}
				<TabPanel
					sx={{
						gridColumn: 'content-start / sidebar-end',
						gridRow: 'header-start / content-end'
					}}
					forTabs={['login']}>
					<LoginPanel />
				</TabPanel>
				{/* end Login screen */}

				{/* Examples screen */}
				<TabPanel
					sx={{
						gridColumn: 'content-start / sidebar-end',
						gridRow: 'header-start / content-end'
					}}
					forTabs={['examples']}
					persistent>
					<ExamplePanel setTabsValue={setTabsValue} />
				</TabPanel>
				{/* end Examples screen*/}

				{/* Editor screen */}
				{/* Editor header */}
				<TabPanel
					sx={{
						gridColumn: 'content-start / content-end',
						gridRow: 'header-start / header-end'
					}}
					forTabs={['editor']}>
					<HeaderPanel />
				</TabPanel>

				{/* Editor content */}
				<TabPanel
					sx={{
						gridColumn: 'content-start / content-end',
						gridRow: 'content-start / content-end',
						position: 'relative'
					}}
					forTabs={['editor']}
					persistent>
					<SceneEditor
						focus={tabsValue === 'editor'}
						simulator={currentSimulator}
						sidebarProps={[open, tabsValue === 'editor']}
						onSimulatorChange={setCurrentSimulator}
					/>
					<EditorToolbar
						editor={yaptideEditor}
						sx={{ position: 'absolute', top: 40, right: 10 }}
					/>
				</TabPanel>

				{/* Editor sidebar */}
				<TabPanel
					sx={{
						gridColumn: 'sidebar-start / sidebar-end',
						gridRow: 'header-start / content-end'
					}}
					forTabs={['editor']}>
					{yaptideEditor && (
						<EditorSidebar
							editor={yaptideEditor}
							simulator={currentSimulator}
							onSimulatorChange={setCurrentSimulator}
						/>
					)}
				</TabPanel>
				{/* end Editor screen */}

				{/* Simulations screen */}
				{/* Content panel lists recent simulations */}
				<TabPanel
					sx={{
						gridColumn: 'content-start / content-end',
						gridRow: 'header-start / content-end'
					}}
					forTabs={['simulations']}>
					<SimulationPanel forwardedSimulator={currentSimulator} />
				</TabPanel>

				{/* Simulations sidebar hosts a form to run the simulation and a list of running simulations */}
				{/* It's also visible in Results screen for quick access to interrupt and rerun the simulation */}
				<TabPanel
					sx={{
						gridColumn: 'sidebar-start / sidebar-end',
						gridRow: 'header-start / content-end'
					}}
					forTabs={['simulations', 'inputFiles', 'results']}>
					<RunSimulationForm
						editorJson={yaptideEditor?.toSerialized()}
						inputFiles={providedInputFiles}
						forwardedSimulator={currentSimulator}
						runSimulation={runSimulation}
					/>
					<RunningQueue />
				</TabPanel>
				{/* end Simulations screen */}

				{/* Input files screen */}
				<TabPanel
					sx={{
						gridColumn: 'content-start / content-end',
						gridRow: 'header-start / content-end'
					}}
					forTabs={['inputFiles']}
					persistentIfVisited>
					<InputEditorPanel
						goToRun={(simulator: SimulatorType, inputFiles?: SimulationInputFiles) => {
							setProvidedInputFiles(inputFiles);
							setCurrentSimulator(simulator);
						}}
						simulator={currentSimulator}
						onSimulatorChange={setCurrentSimulator}
					/>
				</TabPanel>
				{/* end Input files screen */}

				{/* Results screen */}
				{/* Includes header from Editor screen */}

				{/* Content panel show the results of selected simulation */}
				<TabPanel
					sx={{
						gridColumn: 'content-start / content-end',
						gridRow: 'header-start / content-end'
					}}
					forTabs={['results']}
					persistent>
					<ResultsPanel />
				</TabPanel>

				{/* Includes simulations sidebar to view running simulations, switch between partial results, or stop and rerun */}
				{/* end Results screen */}

				{/* About screen */}
				<TabPanel
					sx={{
						gridColumn: 'content-start / sidebar-end',
						gridRow: 'header-start / content-end'
					}}
					forTabs={['about']}
					persistentIfVisited>
					<AboutPanel />
				</TabPanel>
				{/* end About screen */}
			</StyledAppGrid>
		</NavDrawerContext>
	);
}

export default WrapperApp;
