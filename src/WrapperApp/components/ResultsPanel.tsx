import { Grid, Tab, Tabs, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { SyntheticEvent, useState } from 'react';
import { generateGraphs } from '../../JsRoot/GraphData';
import { TabPanel } from './TabPanel';
import { estimators } from '../../JsRoot/simulation_output'

interface ResultsPanelProps {
	data?: Object;
}

const simulationData = (() => {
	const data = [];
	for (let index = 0; index < 5; index++) {
		const numberOfElements = Math.floor(Math.random() * 50) + 100;
		const obj = {
			uuid: index,
			name: `Scoring Mesh${index}`,
			graphs: Array(numberOfElements)
				.fill(0)
				.map((v, i) => {
					const rand = Math.round(Math.random() * numberOfElements) + 1;
					return { uuid: i, title: `Mesh${index} - Graph${i} - ${rand}`, value: rand };
				})
		};
		data.push(obj);
	}

	return data;
})();


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
							<Tab
								key={estimator.name + idx}
								label={estimator.name}
								value={idx}
							/>
						);
					})}
				</Tabs>
				{estimators.map((estimator, idx) => {
					return (
						<TabPanel
							key={"tab_pane_l" + estimator.name + idx}
							value={tabsValue}
							index={idx}
							persistent>
							<Grid key={"grid_" + estimator.name + idx} container spacing={1}>
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
