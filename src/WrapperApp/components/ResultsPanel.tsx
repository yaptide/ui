import { Box, Button, Card, CardContent, Grid, Tab, Tabs, Typography, useMediaQuery } from '@mui/material';
import React, { SyntheticEvent, useEffect, useState } from 'react';
import { generateGraphs } from '../../JsRoot/GraphData';
import { TabPanel } from './TabPanel';
import { useStore } from '../../services/StoreService';
import { saveString } from '../../util/File';

function ResultsPanel() {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

	const { resultsSimulationData: simulation } = useStore();

	const [tabsValue, setTabsValue] = useState(0);

	useEffect(() => {
		setTabsValue(0);
	}, [simulation]);

	const handleChange = (_event: SyntheticEvent, newValue: number) => {
		setTabsValue(newValue);
	};

	const onClickSaveToFile = () => {
		saveString(JSON.stringify(simulation), `${simulation?.name}_result.json`);
	};

	return (
		<Box>
			{simulation && (
				<Card
					sx={{
						margin: '0.5rem',
						padding: '0.5rem',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
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

					<Button size='small' onClick={onClickSaveToFile}>
						Save to file
					</Button>
				</Card>
			)}

			<Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					maxWidth: '100vw',
					width: '100%'
				}}>
				{(simulation?.result?.estimators?.length ?? 0) > 0 && (
					<>
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
											persistentIfVisited>
											<Grid container spacing={1}>
												{generateGraphs(estimator)}
											</Grid>
										</TabPanel>
									);
								})}
							</CardContent>
						</Card>
					</>
				)}
			</Box>
		</Box>
	);
}

export default ResultsPanel;
