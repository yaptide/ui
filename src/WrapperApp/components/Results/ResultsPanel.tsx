import {
	Box,
	Button,
	Card,
	CardContent,
	Grid,
	Tab,
	Tabs,
	Typography,
	useMediaQuery
} from '@mui/material';
import React, { SyntheticEvent, useEffect, useState } from 'react';
import { Estimator, generateGraphs, isPage0d, Page, Page0D } from '../../../JsRoot/GraphData';
import { TabPanel } from '../TabPanel';
import { useStore } from '../../../services/StoreService';
import { saveString } from '../../../util/File';
import TablePage0D from './ResultsTable';

export interface EstimatorResults extends Estimator {
	tablePages: Page0D[];
	gridPages: Page[];
}

function ResultsPanel() {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

	const { resultsSimulationData: simulation } = useStore();

	const [tabsValue, setTabsValue] = useState(0);
	const [estimatorsResults, setEstimatorsResults] = useState<EstimatorResults[]>([]);

	useEffect(() => {
		setTabsValue(0);
		setEstimatorsResults(parseEstimators(simulation?.result?.estimators ?? []));
	}, [simulation]);

	const handleChange = (_event: SyntheticEvent, newValue: number) => {
		setTabsValue(newValue);
	};

	const onClickSaveToFile = () => {
		saveString(JSON.stringify(simulation), `${simulation?.name}_result.json`);
	};

	const parseEstimators = (estimators: Estimator[]) => {
		const estimatorResults = estimators.map(estimator => {
			const tablePages = estimator.pages.filter(isPage0d);
			const gridPages = estimator.pages.filter(p => !isPage0d(p));
			const estimatorResults: EstimatorResults = { ...estimator, tablePages, gridPages };
			return estimatorResults;
		});
		return estimatorResults;
	};

	return (
		<Box
			sx={{
				width: '100%'
			}}>
			{simulation && (
				<Card
					sx={{
						margin: '0.5rem',
						padding: '0.5rem',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center'
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
				{estimatorsResults.length > 0 && (
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
									{estimatorsResults.map((estimator, idx) => {
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
								flexGrow: 1,
								margin: '0.5rem',
								bgcolor: prefersDarkMode ? 'text.disabled' : 'background.paper'
							}}>
							<CardContent>
								{estimatorsResults.map((estimator, idx) => {
									return (
										<TabPanel
											key={`tab_panel_${estimator.name}`}
											value={tabsValue}
											index={idx}
											persistentIfVisited>
											<Grid container spacing={1}>
												{estimator.tablePages.length > 0 && (
													<TablePage0D estimator={estimator}></TablePage0D>
												)}
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
