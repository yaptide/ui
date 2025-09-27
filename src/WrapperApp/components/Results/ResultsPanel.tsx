import {
	Box,
	Button,
	Divider,
	FormControlLabel,
	Switch,
	Typography,
	useTheme
} from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';

import { Estimator, isPage0d, Page, Page0D } from '../../../JsRoot/GraphData';
import { useDialog } from '../../../services/DialogService';
import { useRestSimulation } from '../../../services/RestSimulationContextProvider';
import { useStore } from '../../../services/StoreService';
import { InfoTooltip } from '../../../shared/components/tooltip/InfoTooltip';
import { titleToKebabCase } from '../../../ThreeEditor/components/Dialog/CustomDialog';
import { FullSimulationData } from '../../../types/SimulationService';
import EstimatorsSelect from './EstimatorsSelect/EstimatorsSelect';
import EstimatorTab from './EstimatorTab/EstimatorTab';

export interface EstimatorResults extends Estimator {
	tablePages: Page0D[];
	gridPages: Page[];
}

function ResultsPanel(props: { simulation: FullSimulationData | undefined }) {
	const theme = useTheme();
	const { getJobResults } = useRestSimulation();
	const { open: openSaveFileDialog } = useDialog('saveFile');
	const { yaptideEditor, setResultsSimulationData } = useStore();
	const { simulation } = props;

	const [tabsValue, setTabsValue] = useState(0);
	const [estimatorsResults, setEstimatorsResults] = useState<EstimatorResults[]>([]);
	const [groupQuantities, setGroupQuantities] = useState(false);

	const userTabInputFilesEstimatorNames = simulation?.input.estimatorsItems?.map(
		estimator => estimator.name
	);
	const uploadedInputFilesEstimatorNames = estimatorsResults?.map(estimator => estimator.name);

	const editorEstimatorNames = simulation?.input.inputJson?.scoringManager.outputs
		.filter(output => output.name)
		.map(output => output.name);

	const estimatorsTabData: string[] | undefined = simulation?.input.estimatorsItems
		? userTabInputFilesEstimatorNames
		: editorEstimatorNames;

	// In estimatorsItems we store information about estimators and estimators' pages by dimensions, names, and number of pages
	const estimatorsPagesData = simulation?.input.estimatorsItems;

	useEffect(() => {
		setEstimatorsResults(parseEstimators(simulation?.estimators ?? []));

		if (simulation?.estimators.length === 1) {
			setTabsValue(0);
		}
	}, [simulation]);

	const onClickSaveToFile = () => {
		const expectedEstimators = estimatorsTabData
			? estimatorsTabData
			: uploadedInputFilesEstimatorNames;

		if (yaptideEditor)
			openSaveFileDialog({
				name: `${titleToKebabCase(simulation?.title ?? 'simulation')}-result.json`,
				results: simulation,
				disableCheckbox: true,
				yaptideEditor,
				getJobResults,
				expectedEstimatorsSize: expectedEstimators.length
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

	let title = 'Unknown simulation';

	if (simulation) {
		title = `${simulation.title} [${simulation.startTime.toLocaleString()}]`;
	}

	return (
		<>
			{simulation && (
				<Box
					sx={{
						margin: theme.spacing(1),
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: theme.spacing(2)
					}}>
					<Box>
						<Typography
							gutterBottom
							variant='h5'
							component='div'
							lineHeight={2}>
							{title}
						</Typography>
						<Divider />
					</Box>
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
				</Box>
			)}

			{estimatorsResults.length > 0 && simulation && (
				<>
					<EstimatorsSelect
						tabsValue={tabsValue}
						setTabsValue={setTabsValue}
						simulation={simulation}
						setResultsSimulationData={setResultsSimulationData}
						estimatorsTabData={
							estimatorsTabData ? estimatorsTabData : uploadedInputFilesEstimatorNames
						}
						estimatorsPagesData={estimatorsPagesData}
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
		</>
	);
}

export default ResultsPanel;
