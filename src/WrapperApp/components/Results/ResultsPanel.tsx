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
import { partialResultsLabel, partialRevision } from '../../../util/partialResults';
import EstimatorsSelect from './EstimatorsSelect/EstimatorsSelect';
import EstimatorTab from './EstimatorTab/EstimatorTab';
import { useFollowPartialResults } from './useFollowPartialResults';
import { useOnDemandPages } from './useOnDemandPages';

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
	// another simulation starts at its first estimator; reset while rendering, before EstimatorsSelect loads a tab
	const [shownJobId, setShownJobId] = useState(simulation?.jobId);

	if (simulation?.jobId !== shownJobId) {
		setShownJobId(simulation?.jobId);
		setTabsValue(0);
	}

	const [estimatorsResults, setEstimatorsResults] = useState<EstimatorResults[]>([]);
	const [groupQuantities, setGroupQuantities] = useState(false);
	// re-rendered now and then, so the age of partial results stays right between updates
	const [, setNow] = useState(Date.now());
	const partialLabel = simulation && partialResultsLabel(simulation);
	const isPartial = partialLabel !== undefined;

	useFollowPartialResults(simulation);
	const onDemand = useOnDemandPages(simulation);

	useEffect(() => {
		if (!isPartial) return;
		const timer = setInterval(() => setNow(Date.now()), 30000);

		return () => clearInterval(timer);
	}, [isPartial]);

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

	// the 2D and 3D pages of the estimator on screen load once they come into view (LazyPageGroup), each group once
	// for each partial result: key -> loaded or loading
	const revision = simulation && partialRevision(simulation);
	const [loadedGroups, setLoadedGroups] = useState<Record<string, 'loading' | 'loaded'>>({});
	const latestSimulation = useRef(simulation);
	latestSimulation.current = simulation;
	const tabEstimatorName = (estimatorsTabData ?? uploadedInputFilesEstimatorNames)?.[tabsValue];
	const tabPages =
		estimatorsPagesData?.find(estimator => estimator.name === tabEstimatorName) ??
		estimatorsPagesData?.[tabsValue];

	const groupKey = (dimension: number) =>
		`${simulation?.jobId}|${tabEstimatorName}|${dimension}|${revision ?? 'final'}`;

	// an estimator reloaded for newer results holds only its 0D and 1D pages again
	const loadedHere = (group: PageGroup) =>
		loadedGroups[groupKey(group.dimension)] === 'loaded' &&
		chosenEstimator?.pages.some(page => page.dimensions === group.dimension);

	const pendingGroups =
		simulation?.metadata.simType === 'Geant4' || !chosenEstimator
			? []
			: lazyGroups(pageGroups(tabPages?.pagesByDimensions)).filter(
					group => !loadedHere(group)
				);

	const loadingDimensions = pendingGroups
		.filter(group => loadedGroups[groupKey(group.dimension)] === 'loading')
		.map(group => group.dimension);

	const loadGroup = useCallback(
		async (group: PageGroup) => {
			const shown = latestSimulation.current;

			if (!shown || !tabEstimatorName) return;
			const key = `${shown.jobId}|${tabEstimatorName}|${group.dimension}|${partialRevision(shown) ?? 'final'}`;
			setLoadedGroups(groups => ({ ...groups, [key]: 'loading' }));
			const results = await getEstimatorsPages(
				{
					jobId: shown.jobId,
					estimatorName: tabEstimatorName,
					pageNumbers: group.pageNums,
					revision: partialRevision(shown)
				},
				undefined,
				true
			).catch(error => {
				console.error('Failed to load the pages:', error);

				return undefined;
			});
			const current = latestSimulation.current;
			const pages = results?.estimators.find(e => e.name === tabEstimatorName)?.pages;

			// another simulation or newer results are shown meanwhile: they load their own pages
			if (
				!current ||
				!pages ||
				current.jobId !== shown.jobId ||
				partialRevision(current) !== partialRevision(shown)
			) {
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
						{partialLabel && (
							<Typography
								variant='body2'
								color='warning.main'>
								Partial results: {partialLabel}
							</Typography>
						)}
						{onDemand.available && (
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: theme.spacing(1),
									marginBottom: theme.spacing(1)
								}}>
								<Button
									size='small'
									variant='outlined'
									disabled={onDemand.requested || onDemand.sending}
									onClick={onDemand.request}>
									{onDemand.requested
										? '2D results requested'
										: 'Get 2D results now'}
								</Button>
								<InfoTooltip
									title={
										'Partial results always include 0D and 1D results. 2D results come only when you ask, ' +
										'in the next partial results, and stay as they were until you ask again. ' +
										'3D results come only with the final results.'
									}
								/>
							</Box>
						)}
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
						key={simulation.jobId}
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
						onLoadGroup={loadGroup}
					/>
				</>
			)}
		</>
	);
}

export default ResultsPanel;
