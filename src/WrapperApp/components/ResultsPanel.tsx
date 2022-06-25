import { Box, Card, CardContent, Grid, Tab, Tabs, Typography, useMediaQuery } from '@mui/material';
import React, { SyntheticEvent, useEffect, useState } from 'react';
import { generateGraphs } from '../../JsRoot/GraphData';
import { TabPanel } from './TabPanel';
import { useStore } from '../../services/StoreService';

function ResultsPanel() {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

	const { resultsSimulationData: simulation } = useStore();

	const [tabsValue, setTabsValue] = useState(0);

	const handleChange = (_event: SyntheticEvent, newValue: number) => {
		setTabsValue(newValue);
	};

	useEffect(() => {
		console.log(simulation);
	}, [simulation]);

	return (
		<Box>
			{simulation && (
				<Card
					sx={{
						margin: '0.5rem'
					}}>
					<Typography
						gutterBottom
						variant='h5'
						component='div'
						sx={{
							margin: '1.5rem 1rem'
						}}>
						{simulation.name} [{simulation.creationDate.toLocaleString()}]
					</Typography>
				</Card>
			)}

			<Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					maxWidth: '100vw',
					width: '100%'
				}}>
				<Card
					sx={{
						margin: '0.5rem',
						height: 'min-content',
						overflow: 'unset'
					}}>
					<CardContent>
						<Tabs
							sx={{ flexShrink: 0 }}
							orientation='vertical'
							variant='scrollable'
							value={tabsValue}
							onChange={handleChange}>
							{simulation?.result?.estimators.map((estimator, idx) => {
								return (
									<Tab
										key={`tab_${estimator.name}`}
										label={estimator.name}
										value={idx}
									/>
								);
							})}
						</Tabs>
					</CardContent>
				</Card>
				<Card
					sx={{
						margin: '0.5rem',
						bgcolor: prefersDarkMode ? 'text.disabled' : 'background.paper'
					}}>
					<CardContent>
						{simulation?.result?.estimators.map((estimator, idx) => {
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
					</CardContent>
				</Card>
			</Box>
		</Box>
	);
}

export default ResultsPanel;
