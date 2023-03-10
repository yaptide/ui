import {
	Box,
	Button,
	Card,
	CardContent,
	Tab,
	Tabs,
	Typography,
	useMediaQuery
} from '@mui/material';
import { SyntheticEvent, useEffect, useState } from 'react';
import { Estimator, Page, Page0D, generateGraphs, isPage0d } from '../../../JsRoot/GraphData';
import { useStore } from '../../../services/StoreService';
import { saveString } from '../../../util/File';
import { TabPanel } from '../TabPanel';
import ResultCT from './ResultsCT';
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
		saveString(JSON.stringify(simulation), `${simulation?.title}_result.json`);
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
						{simulation.inputJson?.project.title ?? simulation.title} [
						{simulation.startTime.toLocaleString()}]
					</Typography>

					<Button color='info' size='small' onClick={onClickSaveToFile}>
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
								overflow: 'unset',
								position: 'sticky',
								top: '8px',
								zIndex: 1
							}}>
							<CardContent
								sx={{
									color: prefersDarkMode ? '#fff' : 'secondary.dark'
								}}>
								<Tabs
									textColor='inherit'
									sx={{
										'flexShrink': 0,
										'& .MuiTabs-indicator': {
											backgroundColor: prefersDarkMode
												? '#fff'
												: 'secondary.dark'
										},
										'& .MuiButtonBase-root': {
											fontWeight: 'bold'
										}
									}}
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
							variant='outlined'
							sx={{
								'flexGrow': 1,
								'margin': '0.5rem',
								'bgcolor': prefersDarkMode ? 'text.disabled' : 'background.paper',
								'& .MuiCardContent-root div': {
									bgcolor: 'transparent',
									backgroundImage: 'none',
									color: 'black'
								}
							}}>
							<CardContent>
								{estimatorsResults.map((estimator, idx) => {
									return (
										<TabPanel
											key={`tab_panel_${estimator.name}`}
											value={tabsValue}
											index={idx}
											persistentIfVisited>
											<Box
												style={{
													width: '100%',
													display: 'flex',
													flexDirection: 'column'
												}}>
												{estimator.tablePages.length > 0 && (
													<TablePage0D
														estimator={estimator}></TablePage0D>
												)}
												{generateGraphs(estimator)}
											</Box>
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
