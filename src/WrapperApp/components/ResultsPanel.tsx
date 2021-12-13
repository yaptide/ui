import { Grid, Tab, Tabs } from '@mui/material';
import { Box } from '@mui/system';
import React, { SyntheticEvent, useState } from 'react';
import { generateGraphs } from '../../JsRoot/GraphData';
import { TabPanel } from './TabPanel';
import { estimators } from '../../JsRoot/simulation_output';

interface ResultsPanelProps {
	data?: Object;
}

const ResultsPanel = React.memo(
	function ResultsPanel(props: ResultsPanelProps) {
		const [tabsValue, setTabsValue] = useState<number>(0);
		
		const handleChange = (event: SyntheticEvent, newValue: number) => {
			setTabsValue(newValue);
		};

		return (
			<Box sx={{ display: 'flex', flexDirection: 'row', maxWidth: '100vw', width: '100%' }}>
				<Tabs
					sx={{ flexShrink: 0 }}
					orientation='vertical'
					variant='scrollable'
					value={tabsValue}
					onChange={handleChange}>
					{estimators.map((estimator, idx) => {
						return (
							<Tab key={`tab_${estimator.name}`} label={estimator.name} value={idx} />
						);
					})}
				</Tabs>
				{estimators.map((estimator, idx) => {
					return (
						<TabPanel
							key={`tab_panel_${estimator.name}`}
							value={tabsValue}
							index={idx}
							persistent>
							<Grid container spacing={1}>
								{generateGraphs(estimator)}
							</Grid>
						</TabPanel>
					);
				})}
			</Box>
		);
	},
	(prevProps, nextProps) => true
);

export default ResultsPanel;
