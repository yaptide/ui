import {
	Box,
	Button,
	Divider,
	FormControlLabel,
	Switch,
	Typography,
	useTheme
} from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

import { Estimator, isPage0d, Page, Page0D } from '../../../JsRoot/GraphData';
import { useDialog } from '../../../services/DialogService';
import { useGeant4LocalWorkerSimulation } from '../../../services/Geant4LocalWorkerSimulationContextProvider';
import { useRemoteWorkerSimulation } from '../../../services/RemoteWorkerSimulationContextProvider';
import { useStore } from '../../../services/StoreService';
import { InfoTooltip } from '../../../shared/components/tooltip/InfoTooltip';
import { titleToKebabCase } from '../../../ThreeEditor/components/Dialog/CustomDialog';
import { FullSimulationData } from '../../../types/SimulationService';
import { lazyGroups, PageGroup, pageGroups } from '../../../util/lazyPages';
import EstimatorsSelect from './EstimatorsSelect/EstimatorsSelect';
import EstimatorTab from './EstimatorTab/EstimatorTab';

export interface EstimatorResults extends Estimator {
	tablePages: Page0D[];
	gridPages: Page[];
}

function ResultsPanel(props: { simulation: FullSimulationData | undefined }) {
	const theme = useTheme();
	const remoteWorkerSimulationHandlers = useRemoteWorkerSimulation();
	const geant4LocalWorkerSimulationHandlers = useGeant4LocalWorkerSimulation();
	const { getJobResults } =
		props.simulation?.metadata.simType === 'Geant4'
			? geant4LocalWorkerSimulationHandlers
			: remoteWorkerSimulationHandlers;
	const { getEstimatorsPages } = remoteWorkerSimulationHandlers;
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

	// the 2D and 3D pages of the estimator on screen load once they come into view (LazyPageGroup), each group
	// once: key -> loading, loaded, or failed (then only the Load button tries again)
	const [loadedGroups, setLoadedGroups] = useState<
		Record<string, 'loading' | 'loaded' | 'failed'>
	>({});
	const latestSimulation = useRef(simulation);
	latestSimulation.current = simulation;
	const tabEstimatorName = (estimatorsTabData ?? uploadedInputFilesEstimatorNames)?.[tabsValue];
	const tabPages =
		estimatorsPagesData?.find(estimator => estimator.name === tabEstimatorName) ??
		estimatorsPagesData?.[tabsValue];

	const groupKey = (jobId: string | undefined, dimension: number) =>
		`${jobId}|${tabEstimatorName}|${dimension}`;

	// an estimator loaded again (another tab, the simulation opened again) holds only its 0D and 1D pages
	const loadedHere = (group: PageGroup) =>
		loadedGroups[groupKey(simulation?.jobId, group.dimension)] === 'loaded' &&
		chosenEstimator?.pages.some(page => page.dimensions === group.dimension);

	const pendingGroups =
		simulation?.metadata.simType === 'Geant4' || !chosenEstimator
			? []
			: lazyGroups(pageGroups(tabPages?.pagesByDimensions)).filter(
					group => !loadedHere(group)
				);

	const dimensionsIn = (state: 'loading' | 'failed') =>
		pendingGroups
			.filter(group => loadedGroups[groupKey(simulation?.jobId, group.dimension)] === state)
			.map(group => group.dimension);
	const loadingDimensions = dimensionsIn('loading');
	const failedDimensions = dimensionsIn('failed');

	const loadGroup = useCallback(
		async (group: PageGroup) => {
			const shown = latestSimulation.current;

			if (!shown || !tabEstimatorName) return;
			const key = `${shown.jobId}|${tabEstimatorName}|${group.dimension}`;
			setLoadedGroups(groups => ({ ...groups, [key]: 'loading' }));
			const results = await getEstimatorsPages(
				{
					jobId: shown.jobId,
					estimatorName: tabEstimatorName,
					pageNumbers: group.pageNums
				},
				undefined,
				true
			).catch(error => {
				console.error('Failed to load the pages:', error);

				return undefined;
			});
			const current = latestSimulation.current;
			const pages = results?.estimators.find(e => e.name === tabEstimatorName)?.pages;

			// a failed load is not tried again by itself, so a group in view does not ask again and again
			if (!pages) {
				setLoadedGroups(groups => ({ ...groups, [key]: 'failed' }));

				return;
			}

			// another simulation is shown meanwhile: it loads its own pages
			if (!current || current.jobId !== shown.jobId) {
				setLoadedGroups(groups => {
					const { [key]: _, ...others } = groups;

					return others;
				});

				return;
			}

			const estimators = current.estimators.map(estimator =>
				estimator.name === tabEstimatorName
					? {
							...estimator,
							pages: [
								...estimator.pages.filter(
									page => page.dimensions !== group.dimension
								),
								...pages
							]
						}
					: estimator
			);
			setLoadedGroups(groups => ({ ...groups, [key]: 'loaded' }));
			setResultsSimulationData({ source: 'onLoad', data: { ...current, estimators } });
		},
		[getEstimatorsPages, setResultsSimulationData, tabEstimatorName]
	);

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
						flexDirection: { xs: 'column', sm: 'row' },
						justifyContent: 'space-between',
						alignItems: { xs: 'flex-start', sm: 'center' },
						gap: { xs: theme.spacing(1), sm: 0 },
						marginBottom: theme.spacing(2)
					}}>
					<Box>
						<Typography
							gutterBottom
							variant='h5'
							component='div'
							sx={{
								lineHeight: 2
							}}>
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
						pendingGroups={pendingGroups}
						loadingDimensions={loadingDimensions}
						failedDimensions={failedDimensions}
						onLoadGroup={loadGroup}
					/>
				</>
			)}
		</>
	);
}

export default ResultsPanel;
