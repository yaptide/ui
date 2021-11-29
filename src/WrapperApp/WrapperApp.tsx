import React, { SyntheticEvent, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import LoginPanel from './components/LoginPanel';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import ThreeEditor from '../ThreeEditor/ThreeEditor';
import SimulationPanel from './components/SimulationPanel';
import { useStore } from '../services/StoreService';
import { DEMO_MODE } from '../util/Config';
import { TabPanel } from './components/TabPanel';
import ResultsPanel from './components/ResultsPanel';
import { useAuth } from '../services/AuthService';

function WrapperApp() {
	const { editorRef } = useStore();
	const { isAuthorized, logout } = useAuth();

	const [tabsValue, setTabsValue] = useState(0);

	const handleChange = (event: SyntheticEvent, newValue: number) => {
		setTabsValue(newValue);
	};

	useEffect(() => {
		if (!isAuthorized) setTabsValue(5);
		else setTabsValue(0);
	}, [isAuthorized]);

	const [resultData, setResultData] = useState<{ data?: unknown }>({});

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
					<Tab label='Editor' />
					<Tab label='Run' disabled={DEMO_MODE || !isAuthorized} />
					<Tab label='Results' disabled={DEMO_MODE || !isAuthorized} />
					<Tab label='Projects' disabled />
					<Tab label='About' />
					<Tab
						sx={{ marginLeft: 'auto' }}
						label={isAuthorized && !DEMO_MODE ? 'Logout' : 'Login'}
						onClick={() => isAuthorized && logout()}
						disabled={DEMO_MODE}
					/>
				</Tabs>
			</Box>
			<TabPanel value={tabsValue} index={0} persistent>
				<ThreeEditor
					onEditorInitialized={editor => (editorRef.current = editor)}
					focus={tabsValue === 0}
				/>
			</TabPanel>
			{DEMO_MODE || (
				<>
					<TabPanel value={tabsValue} index={1}>
						<SimulationPanel
							onSuccess={data => {
								setTabsValue(2);
								setResultData({ data });
							}}
						/>
					</TabPanel>

					<TabPanel value={tabsValue} index={2} persistentIfVisited>
						<ResultsPanel data={resultData} />
					</TabPanel>
				</>
			)}
			<TabPanel value={tabsValue} index={5}>
				<LoginPanel />
			</TabPanel>
		</Box>
	);
}
export default WrapperApp;
