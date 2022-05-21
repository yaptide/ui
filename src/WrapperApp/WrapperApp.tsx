import React, { SyntheticEvent, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import LoginPanel from './components/LoginPanel';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import ThreeEditor from '../ThreeEditor/ThreeEditor';
import SimulationPanel from './components/Simulation/SimulationPanel';
import { useStore } from '../services/StoreService';
import { DEMO_MODE } from '../util/Config';
import { TabPanel } from './components/TabPanel';
import ResultsPanel from './components/ResultsPanel';
import { useAuth } from '../services/AuthService';
import InputEditorPanel from './components/InputEditor/InputEditorPanel';
import { AboutPanel } from './components/AboutPanel';

function WrapperApp() {
	const { editorRef, resultsSimulationData } = useStore();
	const { isAuthorized, logout } = useAuth();

	const [tabsValue, setTabsValue] = useState('Editor');

	const handleChange = (event: SyntheticEvent, newValue: string) => {
		setTabsValue(newValue);
	};

	useEffect(() => {
		if (!isAuthorized) setTabsValue('Login');
		else setTabsValue('Editor');
	}, [isAuthorized]);

	useEffect(() => {
		if (resultsSimulationData) setTabsValue('Results');
	}, [resultsSimulationData]);

	return (
		<Box
			sx={{
				width: '100%',
				height: '100vh',
				display: 'flex',
				flexDirection: 'column'
			}}>
			<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
				<Tabs value={tabsValue} onChange={handleChange}>
					<Tab label='Editor' value={'Editor'} />
					<Tab label='Run' value={'Run'} disabled={DEMO_MODE || !isAuthorized} />
					<Tab label='Input Editor' value={'Input Editor'} />
					<Tab
						label='Results'
						value={'Results'}
						disabled={DEMO_MODE || !isAuthorized || !resultsSimulationData}
					/>
					<Tab label='Projects' value={'Projects'} disabled />
					<Tab label='About' value={'About'} />
					<Tab
						sx={{ marginLeft: 'auto' }}
						label={isAuthorized && !DEMO_MODE ? 'Logout' : 'Login'}
						value={'Login'}
						onClick={() => isAuthorized && logout()}
						disabled={DEMO_MODE}
					/>
				</Tabs>
			</Box>
			<TabPanel value={tabsValue} index={'Editor'} persistent>
				<ThreeEditor
					onEditorInitialized={editor => (editorRef.current = editor)}
					focus={tabsValue === 'Editor'}
				/>
			</TabPanel>

			<TabPanel value={tabsValue} index={'Input Editor'} persistentIfVisited>
				<InputEditorPanel goToRun={() => setTabsValue('Run')} />
			</TabPanel>

			{DEMO_MODE && (
				<>
					<TabPanel value={tabsValue} index={'Run'}>
						<SimulationPanel goToResults={() => setTabsValue('Results')} />
					</TabPanel>

					<TabPanel value={tabsValue} index={'Results'} persistent>
						<ResultsPanel />
					</TabPanel>
				</>
			)}

			<TabPanel value={tabsValue} index={'About'} persistentIfVisited>
				<AboutPanel />
			</TabPanel>
			<TabPanel value={tabsValue} index={'Login'}>
				<LoginPanel />
			</TabPanel>
		</Box>
	);
}
export default WrapperApp;
