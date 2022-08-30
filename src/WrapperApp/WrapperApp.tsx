import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import React, { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { JsRootService } from '../JsRoot/JsRootService';
import { useAuth } from '../services/AuthService';
import { useStore } from '../services/StoreService';
import { EditorExample } from '../ThreeEditor/examples/examples';
import { Editor } from '../ThreeEditor/js/Editor';
import ThreeEditor from '../ThreeEditor/ThreeEditor';
import { DEMO_MODE } from '../util/Config';
import { AboutPanel } from './components/AboutPanel';
import InputEditorPanel from './components/InputEditor/InputEditorPanel';
import LoginPanel from './components/LoginPanel';
import ResultsPanel from './components/ResultsPanel';
import SimulationPanel from './components/Simulation/SimulationPanel';
import SimulationPanelDemo from './components/Simulation/SimulationPanelDemo';
import { TabPanel } from './components/TabPanel';
import YapDrawer from './components/YapDrawer/YapDrawer';

function WrapperApp() {
	const { editorRef, resultsSimulationData, setResultsSimulationData } = useStore();
	const { isAuthorized, logout } = useAuth();

	const [open, setOpen] = React.useState(false);
	const [tabsValue, setTabsValue] = useState('editor');

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

	const onLoadExample = useCallback(
		(example: EditorExample) => {
			if (!DEMO_MODE) return;
			setResultsSimulationData(example.result);
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
					openSidebar={open}
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
		// 	<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
		// 		<Tabs value={tabsValue} onChange={handleChange}>
		// 			<Tab label='Editor' value={'Editor'} />
		// 			<Tab label='Input Editor' value={'Input Editor'} />
		// 			<Tab label='Run' value={'Run'} disabled={!DEMO_MODE && !isAuthorized} />
		// 			<Tab
		// 				label='Results'
		// 				value={'Results'}
		// 				disabled={(!DEMO_MODE && !isAuthorized) || !resultsSimulationData}
		// 			/>
		// 			<Tab label='Projects' value={'Projects'} disabled />
		// 			<Tab label='About' value={'About'} />
		// 			<Tab
		// 				sx={{ marginLeft: 'auto' }}
		// 				label={isAuthorized && !DEMO_MODE ? 'Logout' : 'Login'}
		// 				value={'Login'}
		// 				onClick={() => isAuthorized && logout()}
		// 				disabled={DEMO_MODE}
		// 			/>
		// 		</Tabs>
		// 	</Box>
	);
}
export default WrapperApp;
