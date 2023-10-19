import {
	Box,
	Button,
	Card,
	CardContent,
	FormControlLabel,
	Switch,
	Tab,
	Tabs,
	Typography
} from '@mui/material';
import { ChangeEvent, SyntheticEvent, useEffect, useState } from 'react';

import { Estimator, generateGraphs, isPage0d, Page, Page0D } from '../../../JsRoot/GraphData';
import { useDialog } from '../../../services/DialogService';
import { useStore } from '../../../services/StoreService';
import { InfoTooltip } from '../../../shared/components/tooltip/InfoTooltip';
import { titleToKebabCase } from '../../../ThreeEditor/components/Dialog/CustomDialog';
import { TabPanel } from '../Panels/TabPanel';
import TablePage0D from './ResultsTable';

export interface EstimatorResults extends Estimator {
	tablePages: Page0D[];
	gridPages: Page[];
}

function ResultsPanel() {
	const { open: openSaveFileDialog } = useDialog('saveFile');
	const { yaptideEditor, resultsSimulationData: simulation } = useStore();

	const [tabsValue, setTabsValue] = useState(0);
	const [estimatorsResults, setEstimatorsResults] = useState<EstimatorResults[]>([]);
	const [groupQuantities, setGroupQuantities] = useState(false);

	useEffect(() => {
		setTabsValue(0);
		setEstimatorsResults(parseEstimators(simulation?.estimators ?? []));
	}, [simulation]);

	const handleChange = (_event: SyntheticEvent, newValue: number) => {
		setTabsValue(newValue);
	};

	const onClickSaveToFile = () => {
		if (yaptideEditor)
			openSaveFileDialog({
				name: `${titleToKebabCase(simulation?.title ?? 'simulation')}-result.json`,
				results: simulation,
				disableCheckbox: true,
				yaptideEditor
			});
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

	const resultsGeneratedFromProjectFile = !!simulation?.input.inputJson;

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
						{simulation.title ??
							simulation.input.inputJson?.project.title ??
							'Unknown simulation'}{' '}
						[{simulation.startTime.toLocaleString()}]
					</Typography>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							gap: '0.5rem'
						}}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								marginRight: '0.5rem'
							}}>
							<FormControlLabel
								sx={{ marginRight: '0' }}
								control={
									<Switch
										checked={groupQuantities}
										onChange={(e: ChangeEvent<HTMLInputElement>) =>
											setGroupQuantities(e.target.checked)
										}
										disabled={!resultsGeneratedFromProjectFile}
									/>
								}
								label='Group Quantities'
							/>
							{!resultsGeneratedFromProjectFile && (
								<InfoTooltip
									sx={{ marginLeft: '0.25rem' }}
									title={
										'Grouping quantities is only available when results are generated from a project file.'
									}
								/>
							)}
						</Box>
						<Button
							color='info'
							size='small'
							onClick={onClickSaveToFile}>
							Save to file
						</Button>
					</Box>
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
									color: theme =>
										theme.palette.mode === 'dark'
											? 'secondary.contrastText'
											: 'secondary.dark'
								}}>
								<Tabs
									textColor='inherit'
									sx={{
										'flexShrink': 0,
										'& .MuiTabs-indicator': {
											backgroundColor: theme =>
												theme.palette.mode === 'dark'
													? 'secondary.contrastText'
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
								'bgcolor': theme =>
									theme.palette.mode === 'dark'
										? 'text.disabled'
										: 'background.paper',
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
											key={`tab_panel_${estimator.name}_${idx}`}
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
												{generateGraphs(
													estimator,
													resultsGeneratedFromProjectFile &&
														groupQuantities,
													simulation?.jobId
												)}
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
