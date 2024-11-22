import { Box, Button, Card, FormControlLabel, Switch, Typography } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';

import { Estimator, isPage0d, Page, Page0D } from '../../../JsRoot/GraphData';
import { useDialog } from '../../../services/DialogService';
import { useStore } from '../../../services/StoreService';
import { InfoTooltip } from '../../../shared/components/tooltip/InfoTooltip';
import { titleToKebabCase } from '../../../ThreeEditor/components/Dialog/CustomDialog';
import EstimatorsSelect from './EstimatorsSelect/EstimatorsSelect';
import EstimatorTab from './EstimatorTab/EstimatorTab';

export interface EstimatorResults extends Estimator {
	tablePages: Page0D[];
	gridPages: Page[];
}

function ResultsPanel() {
	const { open: openSaveFileDialog } = useDialog('saveFile');
	const {
		yaptideEditor,
		resultsSimulationData: simulation,
		setResultsSimulationData
	} = useStore();

	const [tabsValue, setTabsValue] = useState(0);
	const [estimatorsResults, setEstimatorsResults] = useState<EstimatorResults[]>([]);
	const [groupQuantities, setGroupQuantities] = useState(false);

	const userTabInputFilesEstimatorNames = simulation?.input.userInputFilesEstimatorNames?.map(
		output => output.slice(0, -1)
	);
	const uploadedInputFilesEstimatorNames = estimatorsResults?.map(estimator => estimator.name);

	const editorEstimatorNames = simulation?.input.inputJson?.scoringManager.outputs
		.filter(output => output.name)
		.map(output => output.name);

	const estimatorsTabData: string[] | undefined = simulation?.input.userInputFilesEstimatorNames
		? userTabInputFilesEstimatorNames
		: editorEstimatorNames;

	useEffect(() => {
		setEstimatorsResults(parseEstimators(simulation?.estimators ?? []));

		if (simulation?.estimators.length === 1) {
			setTabsValue(0);
		}
	}, [simulation]);

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
	const chosenEstimator = estimatorsResults[tabsValue];

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
				{estimatorsResults.length > 0 && simulation && (
					<>
						<EstimatorsSelect
							tabsValue={tabsValue}
							setTabsValue={setTabsValue}
							simulation={simulation}
							setResultsSimulationData={setResultsSimulationData}
							estimatorsTabData={
								estimatorsTabData
									? estimatorsTabData
									: uploadedInputFilesEstimatorNames
							}
						/>
						<EstimatorTab
							estimator={chosenEstimator}
							tabsValue={tabsValue}
							resultsGeneratedFromProjectFile={resultsGeneratedFromProjectFile}
							groupQuantities={groupQuantities}
							simulation={simulation}
						/>
					</>
				)}
			</Box>
		</Box>
	);
}

export default ResultsPanel;
