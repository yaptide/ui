import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import {
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	Checkbox,
	Chip,
	FormControl,
	FormControlLabel,
	FormGroup,
	InputLabel,
	Link,
	MenuItem,
	Select,
	SelectChangeEvent,
	TextField,
	ToggleButton,
	Tooltip,
	useTheme
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { MouseEvent, SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';

import { useConfig } from '../../../config/ConfigService';
import { DownloadManagerStatus } from '../../../Geant4Worker/Geant4DatasetManager';
import { usePythonConverter } from '../../../PythonConverter/PythonConverterService';
import { useAuth } from '../../../services/AuthService';
import { useSharedDatasetManager } from '../../../services/Geant4DatasetContextProvider';
import { useInputFiles } from '../../../services/InputFilesContextProvider';
import { useStore } from '../../../services/StoreService';
import StyledAccordion from '../../../shared/components/StyledAccordion';
import { StyledExclusiveToggleButtonGroup } from '../../../shared/components/StyledExclusiveToggleButtonGroup';
import { StyledTab, StyledTabs } from '../../../shared/components/Tabs/StyledTabs';
import { EditorJson } from '../../../ThreeEditor/js/EditorJson';
import { SimulationFetchSource, SimulatorNames, SimulatorType } from '../../../types/RequestTypes';
import { SimulationInputFiles } from '../../../types/ResponseTypes';
import {
	checkSelection,
	FileHint,
	RUNNABLE_SIMULATORS,
	RunnableSimulator,
	simulatorName,
	sortInputFileNames
} from '../InputEditor/simulatorDetection';
import { BatchScriptParametersEditor } from './BatchParametersEditor';
import {
	Geant4DatasetDownloadSelector,
	Geant4Datasets,
	Geant4DatasetsType
} from './Geant4DatasetDownload';

function a11yProps(index: number, name: string = 'RunSimulation') {
	return {
		'id': `${name}Tab${index}`,
		'aria-controls': `${name}Tabpanel${index}`
	};
}

export type SimulationRunType = 'direct' | 'batch';
export type SimulationSourceType = 'editor' | 'files';
export type ScriptOption = {
	optionKey: string;
	optionLabel?: string;
	optionValue: string;
	optionList?: Omit<ScriptOption, 'optionList'>[];
};
export type BatchOptionsType = {
	clusterName?: string;
	arrayOptions?: ScriptOption[];
	arrayHeader?: string;
	collectOptions?: ScriptOption[];
	collectHeader?: string;
};

export type RunSimulationFunctionType = (
	runType: SimulationRunType,
	editorJson: EditorJson,
	inputFiles: Partial<SimulationInputFiles>,
	sourceType: SimulationSourceType,
	simName: string,
	nTasks: number,
	forwardedSimulator: SimulatorType,
	batchOptions: BatchOptionsType,
	geant4DatasetType: Geant4DatasetsType
) => void;

export type RunSimulationFormProps = {
	availableClusters?: string[];
	editorJson?: EditorJson;
	runSimulation?: RunSimulationFunctionType;
	setSource?: (source: SimulationFetchSource) => void;
	geant4DatasetType: Geant4DatasetsType;
	setGeant4DatasetType: (type: Geant4DatasetsType) => void;
};

export function RunSimulationForm({
	availableClusters = ['default'],
	editorJson,
	runSimulation = () => {},
	setSource = () => {},
	geant4DatasetType,
	setGeant4DatasetType
}: RunSimulationFormProps) {
	const theme = useTheme();
	const [usingBatchConfig, setUsingBatchConfig] = useState(false);
	const [simulationRunType, setSimulationRunType] = useState<SimulationRunType>('direct');
	const { yaptideEditor } = useStore();
	const { demoMode } = useConfig();
	const { isAuthorized } = useAuth();
	const {
		inputFiles,
		selectedFiles,
		detection,
		requiredFiles: requiredInputFiles,
		runSimulator: filesRunSimulator,
		additionCount,
		toggleSelected,
		setSelectedFiles,
		setRunSimulator: setFilesRunSimulator
	} = useInputFiles();
	const hasInputFiles = Object.keys(inputFiles).length > 0;
	const [simulationSourceType, setSimulationSourceType] = useState<SimulationSourceType>(
		hasInputFiles ? 'files' : 'editor'
	);
	const currentSimulator = yaptideEditor?.contextManager.currentSimulator || SimulatorType.COMMON;
	const remoteWorkersAvailable = !demoMode && isAuthorized;

	// When simulator is set to COMMON, user needs to select which actual simulator to run
	// This should not change the simulator in editor, only in this form.
	const editorSimulatorOptions =
		currentSimulator !== SimulatorType.COMMON
			? [currentSimulator]
			: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA];

	const [editorRunSimulator, setEditorRunSimulator] = useState<SimulatorType>(
		editorSimulatorOptions[0]
	);

	useEffect(() => {
		setEditorRunSimulator(editorSimulatorOptions[0]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentSimulator]);

	const availabilityReason = (simulator: SimulatorType) => {
		if (simulator === SimulatorType.GEANT4 || remoteWorkersAvailable) return undefined;

		return demoMode
			? `${SimulatorNames.get(simulator)} can't run in demo mode`
			: `Running ${SimulatorNames.get(simulator)} requires login`;
	};

	const unavailableReason = (simulator: RunnableSimulator) => {
		const availability = availabilityReason(simulator);

		if (availability) return availability;

		if (!detection) return 'Checking files…';

		return detection.simulators[simulator].possible
			? undefined
			: detection.simulators[simulator].reason;
	};

	const runSimulator = simulationSourceType === 'files' ? filesRunSimulator : editorRunSimulator;

	const requiredFiles = useMemo(
		() => requiredInputFiles?.[filesRunSimulator] ?? [],
		[requiredInputFiles, filesRunSimulator]
	);

	const selection = useMemo(
		() =>
			detection && requiredInputFiles
				? checkSelection(
						filesRunSimulator,
						requiredFiles,
						selectedFiles,
						inputFiles,
						detection
					)
				: undefined,
		[filesRunSimulator, requiredFiles, requiredInputFiles, selectedFiles, inputFiles, detection]
	);

	const presentRequired = requiredFiles.filter(name => name in inputFiles);
	const unselectedRequired = presentRequired.filter(name => !selectedFiles.includes(name));
	const selectRequiredDisabledReason = !selection
		? 'Checking files…'
		: presentRequired.length === 0
			? `None of the files ${simulatorName(filesRunSimulator)} requires are here yet (${requiredFiles.join(', ')})`
			: unselectedRequired.length === 0
				? 'All required files are already selected'
				: undefined;

	const [overridePrimariesCount, setOverridePrimariesCount] = useState(
		yaptideEditor?.beam.numberOfParticles ?? 0
	);

	// Show a pulsating animation to bring attention to form changes
	const [animation, setAnimation] = useState('none');
	const initialAdditionCount = useRef(additionCount);
	useEffect(() => {
		if (additionCount === initialAdditionCount.current) return;
		setSimulationSourceType('files');
		setAnimation('highlight 1s linear 0s 2');
		const timeout = setTimeout(() => setAnimation('none'), 2500);

		return () => clearTimeout(timeout);
	}, [additionCount]);

	useEffect(() => {
		if (!hasInputFiles) setSimulationSourceType('editor');
	}, [hasInputFiles]);

	const [selectedCluster, setSelectedCluster] = useState<number | undefined>(0);

	const [simName, setSimName] = useState(editorJson?.project.title ?? '');
	const [nTasks, setNTasks] = useState(1);
	const [arrayHeader, setArrayHeader] = useState<string>('');
	const [collectHeader, setCollectHeader] = useState<string>('');
	const [arrayOptions, setArrayOptions] = useState<ScriptOption[]>([]);
	const [collectOptions, setCollectOptions] = useState<ScriptOption[]>([]);
	const [selectedScriptParamsTab, setSelectedScriptParamsTab] = useState(0);
	const { isConverterReady } = usePythonConverter();
	const { managerState: geant4DownloadManagerState } = useSharedDatasetManager();
	const runsGeant4 = runSimulator === SimulatorType.GEANT4;

	const findBlockReason = () => {
		const availability = availabilityReason(runSimulator);

		if (availability) return availability;

		if (simulationSourceType === 'files') {
			if (!selection) return 'Checking files…';

			if (selection.reason) return selection.reason;
		}

		if (isNaN(nTasks) || isNaN(overridePrimariesCount))
			return 'Fill in the number of tasks and primary particles';

		if (runsGeant4 && !isConverterReady) return 'Waiting for the converter to load';

		if (
			runsGeant4 &&
			geant4DatasetType === Geant4DatasetsType.FULL &&
			geant4DownloadManagerState !== DownloadManagerStatus.FINISHED
		)
			return 'Download the FULL Geant4 datasets below or choose PARTIAL';

		return undefined;
	};

	const blockReason = findBlockReason();

	const handleChangeCluster = (event: SelectChangeEvent) => {
		setSelectedCluster(parseInt(event.target.value));
	};

	const handleRunTypeChange = (
		event: MouseEvent<HTMLElement>,
		newRunType: SimulationRunType | null
	) => {
		if (newRunType === null) return;
		setSimulationRunType(newRunType);
	};

	const handleSourceTypeChange = (
		event: MouseEvent<HTMLElement>,
		newSourceType: SimulationSourceType | null
	) => {
		if (newSourceType === null) return;
		setSimulationSourceType(newSourceType);
	};

	const handleParamsTabChange = (event: SyntheticEvent, newValue: number) => {
		setSelectedScriptParamsTab(newValue);
	};

	const handleRunSimulationClick = () => {
		if (blockReason !== undefined) {
			return;
		}

		const filteredInputFiles = Object.fromEntries(
			selectedFiles.filter(name => name in inputFiles).map(name => [name, inputFiles[name]])
		) as Partial<SimulationInputFiles>;

		const batchOptions = {
			clusterName: availableClusters[selectedCluster ?? 0],
			arrayHeader,
			arrayOptions,
			collectHeader,
			collectOptions
		};

		if (editorJson && simulationSourceType)
			editorJson.beam.numberOfParticles = overridePrimariesCount;

		setSource(runSimulator === SimulatorType.GEANT4 ? 'local' : 'remote');

		runSimulation(
			simulationRunType,
			editorJson!,
			filteredInputFiles,
			simulationSourceType,
			simName,
			nTasks,
			runSimulator,
			batchOptions,
			geant4DatasetType
		);
	};

	const hintIcon = (hint: FileHint | undefined) =>
		hint?.kind === 'ok' ? <CheckCircleOutlineIcon /> : undefined;

	return (
		<>
			<StyledAccordion
				expanded={true}
				sx={{
					// the following styles attempt to create a border that
					// will pulse green when highlight == true, and be invisible otherwise
					// We cannot just have border='none' as it would make content shift
					// so the border needs to be present all the time, matching the background color
					'marginLeft': `calc(${theme.spacing(1)} - 2px)`,
					'marginTop': `calc(${theme.spacing(1)} - 2px)`,
					'marginRight': theme.spacing(1),
					'marginBottom': theme.spacing(1),
					'width': `calc(100% - ${theme.spacing(2)})`,
					'borderWidth': '2px',
					'borderStyle': 'solid',
					'borderColor': theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
					'@keyframes highlight': {
						'0%': {},
						'50%': { borderColor: theme.palette.success.main },
						'100%': {}
					},
					'animation': animation
				}}>
				<AccordionSummary>
					<Typography
						sx={{
							textTransform: 'none',
							fontSize: 16
						}}>
						Run new simulation
					</Typography>
				</AccordionSummary>
				<AccordionDetails
					sx={{
						'display': 'flex',
						'flexDirection': 'column',
						'& .MuiToggleButtonGroup-root, & .MuiFormControl-root': {
							marginBottom: theme.spacing(2)
						}
					}}>
					{runSimulator !== SimulatorType.GEANT4 ? (
						<StyledExclusiveToggleButtonGroup
							fullWidth
							value={simulationRunType}
							onChange={handleRunTypeChange}>
							<ToggleButton value='direct'>Direct Run</ToggleButton>
							<ToggleButton value='batch'>Batch Run</ToggleButton>
						</StyledExclusiveToggleButtonGroup>
					) : (
						<Box sx={{ pt: theme.spacing(1) }} />
					)}
					{simulationRunType === 'batch' && (
						<FormGroup>
							<FormControlLabel
								control={
									<Checkbox
										checked={usingBatchConfig}
										onChange={(_, checked) => setUsingBatchConfig(checked)}
									/>
								}
								label='Use batch config'
							/>
						</FormGroup>
					)}
					{(!usingBatchConfig || simulationRunType === 'direct') && (
						<>
							<TextField
								size='small'
								label='Simulation Name'
								value={simName}
								fullWidth
								onChange={e => setSimName(e.target.value)}
							/>
							<TextField
								size='small'
								type='number'
								label='Number of tasks'
								disabled={runSimulator === SimulatorType.GEANT4}
								error={isNaN(nTasks)}
								value={
									runSimulator === SimulatorType.GEANT4
										? 1
										: isNaN(nTasks)
											? ''
											: nTasks
								}
								onChange={e => setNTasks(Math.max(1, parseInt(e.target.value)))}
							/>
							<TextField
								size='small'
								type='number'
								label='Number of primary particles'
								error={isNaN(overridePrimariesCount)}
								value={isNaN(overridePrimariesCount) ? '' : overridePrimariesCount}
								onChange={e =>
									setOverridePrimariesCount(Math.max(1, parseInt(e.target.value)))
								}
							/>
							{simulationSourceType === 'editor' ? (
								<FormControl
									fullWidth
									disabled={editorSimulatorOptions.length < 2}>
									<InputLabel id='simulator-select-label'>
										Simulation software
									</InputLabel>
									<Select
										labelId='simulator-select-label'
										size='small'
										label='Simulation software'
										value={editorRunSimulator}
										onChange={evn =>
											setEditorRunSimulator(evn.target.value as SimulatorType)
										}>
										{editorSimulatorOptions.map(simulator => (
											<MenuItem
												key={simulator}
												value={simulator}>
												{SimulatorNames.get(simulator)}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							) : (
								<FormControl fullWidth>
									<InputLabel id='simulator-select-label'>
										Simulation software
									</InputLabel>
									<Select
										labelId='simulator-select-label'
										size='small'
										label='Simulation software'
										value={filesRunSimulator}
										renderValue={value => simulatorName(value)}
										onChange={evn =>
											setFilesRunSimulator(
												evn.target.value as RunnableSimulator
											)
										}>
										{RUNNABLE_SIMULATORS.map(simulator => {
											const reason = unavailableReason(simulator);

											return (
												<MenuItem
													key={simulator}
													value={simulator}
													sx={
														reason
															? { color: 'text.disabled' }
															: undefined
													}>
													<Tooltip
														title={reason ?? ''}
														placement='left'
														disableHoverListener={!reason}>
														<Box sx={{ width: '100%' }}>
															{simulatorName(simulator)}
														</Box>
													</Tooltip>
												</MenuItem>
											);
										})}
									</Select>
								</FormControl>
							)}
							<StyledExclusiveToggleButtonGroup
								fullWidth
								value={simulationSourceType}
								onChange={handleSourceTypeChange}>
								<ToggleButton value='editor'>Editor Project Data</ToggleButton>
								<ToggleButton
									value='files'
									disabled={!hasInputFiles}>
									Input Files Data
								</ToggleButton>
							</StyledExclusiveToggleButtonGroup>
							{simulationSourceType === 'files' && (
								<Box
									sx={{
										display: 'flex',
										gap: 1,
										flexWrap: 'wrap',
										justifyContent: 'center',
										marginBottom: theme.spacing(1)
									}}>
									{sortInputFileNames(
										Object.keys(inputFiles),
										detection,
										requiredInputFiles
									).map(name => {
										const selected = selectedFiles.includes(name);
										const hint = selection?.hints[name];
										const suggested = hint?.kind === 'suggest';

										return (
											<Tooltip
												key={name}
												title={
													hint?.message ??
													(selected
														? 'Included in the run'
														: 'Not included in the run')
												}>
												<Chip
													color={selected ? 'success' : 'default'}
													variant='outlined'
													icon={hintIcon(hint)}
													label={<Typography>{name}</Typography>}
													deleteIcon={
														selected ? (
															<RemoveCircleIcon />
														) : (
															<ControlPointIcon />
														)
													}
													onClick={() => toggleSelected(name)}
													onDelete={() => toggleSelected(name)}
													sx={{
														'& .MuiChip-icon': {
															color: 'success.main'
														},
														...(suggested && {
															'borderStyle': 'dashed',
															'borderColor': 'success.main',
															'& .MuiChip-deleteIcon': {
																color: 'success.main'
															}
														})
													}}
												/>
											</Tooltip>
										);
									})}
								</Box>
							)}
							{simulationSourceType === 'files' && (
								<>
									<Tooltip title={selectRequiredDisabledReason ?? ''}>
										<Box
											component='span'
											sx={{
												alignSelf: 'center',
												marginBottom: theme.spacing(2)
											}}>
											<Button
												size='small'
												disabled={
													selectRequiredDisabledReason !== undefined
												}
												onClick={() =>
													setSelectedFiles([
														...selectedFiles,
														...unselectedRequired
													])
												}>
												Select required files
											</Button>
										</Box>
									</Tooltip>
								</>
							)}
						</>
					)}
					{usingBatchConfig && simulationRunType === 'batch' && (
						<>
							<FormControl fullWidth>
								<InputLabel id='cluster-select-label'>Cluster</InputLabel>
								<Select
									labelId='cluster-select-label'
									label='Cluster'
									value={`${selectedCluster}`}
									size='small'
									onChange={handleChangeCluster}>
									{availableClusters.map((cluster, index) => (
										<MenuItem
											key={index}
											value={index}>
											{cluster}
										</MenuItem>
									))}
								</Select>
							</FormControl>
							<Box
								sx={{
									borderStyle: 'solid',
									borderWidth: 1,
									borderColor:
										theme.palette.mode === 'light'
											? 'rgba(0, 0, 0, 0.23)'
											: 'rgba(255, 255, 255, 0.23)',
									borderRadius: theme.spacing(1),
									padding: theme.spacing(1),
									marginBottom: theme.spacing(2)
								}}>
								<StyledTabs
									value={selectedScriptParamsTab}
									onChange={handleParamsTabChange}>
									<StyledTab
										sx={{ flexGrow: 1 }}
										label='Array Script'
										{...a11yProps(0, 'BatchScriptParams')}
									/>
									<StyledTab
										sx={{ flexGrow: 1 }}
										label='Collect Script'
										{...a11yProps(1, 'BatchScriptParams')}
									/>
								</StyledTabs>
								{selectedScriptParamsTab === 0 && (
									<BatchScriptParametersEditor
										scriptHeader={arrayHeader}
										scriptOptions={arrayOptions}
										handleScriptHeaderChange={evn =>
											setArrayHeader(evn.target.value)
										}
										handleScriptOptionsChange={setArrayOptions}
										scriptName={'array'}
									/>
								)}
								{selectedScriptParamsTab === 1 && (
									<BatchScriptParametersEditor
										scriptHeader={collectHeader}
										scriptOptions={collectOptions}
										handleScriptHeaderChange={evn =>
											setCollectHeader(evn.target.value)
										}
										handleScriptOptionsChange={setCollectOptions}
										scriptName={'collect'}
									/>
								)}
							</Box>
						</>
					)}
					{runSimulator === SimulatorType.GEANT4 && (
						<Geant4DatasetDownloadSelector
							geant4DatasetType={geant4DatasetType}
							setGeant4DatasetType={setGeant4DatasetType}
						/>
					)}
					<Box sx={{ display: 'flex', justifyContent: 'center' }}>
						<Button
							sx={{
								height: '36px',
								width: '180px'
							}}
							variant='contained'
							size='large'
							disabled={!usingBatchConfig && blockReason !== undefined}
							onClick={handleRunSimulationClick}>
							Start simulation
						</Button>
					</Box>
					{blockReason && (
						<Typography
							variant='caption'
							color='textSecondary'
							sx={{ textAlign: 'center', marginTop: theme.spacing(1) }}>
							{blockReason}
						</Typography>
					)}
					{demoMode && availabilityReason(runSimulator) && (
						<Typography
							variant='caption'
							color='textSecondary'
							sx={{ textAlign: 'center' }}>
							For the full version of the app, head to{' '}
							<Link
								color='secondary'
								underline='none'
								href={'https://yaptide.c3.plgrid.pl'}>
								yaptide.c3.plgrid.pl
							</Link>{' '}
							or follow{' '}
							<Link
								color='secondary'
								underline='none'
								href={'https://yaptide.github.io/for_developers/'}>
								installation steps
							</Link>{' '}
							to run it locally. Geant4 runs in demo mode too.
						</Typography>
					)}
				</AccordionDetails>
			</StyledAccordion>
			{runsGeant4 && geant4DatasetType === Geant4DatasetsType.FULL && <Geant4Datasets />}
		</>
	);
}
