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
	MenuItem,
	Select,
	SelectChangeEvent,
	TextField,
	ToggleButton,
	useTheme
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { MouseEvent, SyntheticEvent, useEffect, useState } from 'react';

import { DownloadManagerStatus } from '../../../Geant4Worker/Geant4DatasetDownloadManager';
import { usePythonConverter } from '../../../PythonConverter/PythonConverterService';
import { useStore } from '../../../services/StoreService';
import StyledAccordion from '../../../shared/components/StyledAccordion';
import { StyledExclusiveToggleButtonGroup } from '../../../shared/components/StyledExclusiveToggleButtonGroup';
import { StyledTab, StyledTabs } from '../../../shared/components/Tabs/StyledTabs';
import { EditorJson } from '../../../ThreeEditor/js/EditorJson';
import { SimulationFetchSource, SimulatorNames, SimulatorType } from '../../../types/RequestTypes';
import { SimulationInputFiles } from '../../../types/ResponseTypes';
import { BatchScriptParametersEditor } from './BatchParametersEditor';
import { Geant4DatasetsType } from './Geant4DatasetDownload';

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
	inputFiles?: Partial<SimulationInputFiles>;
	highlight?: boolean;
	clearInputFiles?: () => void;
	runSimulation?: RunSimulationFunctionType;
	setSource?: (source: SimulationFetchSource) => void;
	geant4DownloadManagerState: DownloadManagerStatus;
	geant4DatasetType: Geant4DatasetsType;
	setGeant4DatasetType: (type: Geant4DatasetsType) => void;
};

export function RunSimulationForm({
	availableClusters = ['default'],
	editorJson,
	inputFiles,
	highlight = false,
	clearInputFiles = () => {},
	runSimulation = () => {},
	setSource = () => {},
	geant4DownloadManagerState,
	geant4DatasetType,
	setGeant4DatasetType
}: RunSimulationFormProps) {
	const theme = useTheme();
	const [usingBatchConfig, setUsingBatchConfig] = useState(false);
	const [simulationRunType, setSimulationRunType] = useState<SimulationRunType>('direct');
	const [simulationSourceType, setSimulationSourceType] = useState<SimulationSourceType>(
		inputFiles && Object.keys(inputFiles).length > 0 ? 'files' : 'editor'
	);
	const { yaptideEditor } = useStore();
	const currentSimulator = yaptideEditor?.contextManager.currentSimulator || SimulatorType.COMMON;

	// When simulator is set to COMMON, user needs to select which actual simulator to run
	// This should not change the simulator in editor, only in this form.
	// When using input files to run, the simulator in info.json should also take precedence
	const [runSimulator, setRunSimulator] = useState<SimulatorType>(
		currentSimulator !== SimulatorType.COMMON ? currentSimulator : SimulatorType.SHIELDHIT
	);

	const [runSimulatorOptions, setRunSimulatorOptions] = useState(
		currentSimulator !== SimulatorType.COMMON
			? [currentSimulator]
			: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA]
	);

	const [overridePrimariesCount, setOverridePrimariesCount] = useState(
		yaptideEditor?.beam.numberOfParticles ?? 0
	);

	useEffect(() => {
		// When either currentSimulator or sourceType changes,
		// reset the selected simulator according to the rules defined for runSimulator above
		if (simulationSourceType === 'files') {
			let simulator: SimulatorType;

			switch (true) {
				case inputFiles?.hasOwnProperty('geo.dat'):
					simulator = SimulatorType.SHIELDHIT;

					break;
				case inputFiles?.hasOwnProperty('fl_sim.inp'):
					simulator = SimulatorType.FLUKA;

					break;
				case inputFiles?.hasOwnProperty('run.mac'): // not implemented, placeholder value
					simulator = SimulatorType.GEANT4;

					break;
				default:
					simulator = SimulatorType.COMMON;

					break;
			}

			setRunSimulator(simulator);
			setRunSimulatorOptions([simulator]);
		} else {
			setRunSimulator(
				currentSimulator !== SimulatorType.COMMON
					? currentSimulator
					: SimulatorType.SHIELDHIT
			);

			setRunSimulatorOptions(
				currentSimulator !== SimulatorType.COMMON
					? [currentSimulator]
					: [SimulatorType.SHIELDHIT, SimulatorType.FLUKA]
			);
		}
	}, [yaptideEditor, simulationSourceType, inputFiles]);

	useEffect(() => {
		if (inputFiles && Object.keys(inputFiles).length > 0) {
			setSimulationSourceType('files');
			setSelectedFiles(Object.keys(inputFiles));
		} else {
			setSimulationSourceType('editor');
		}
	}, [inputFiles]);

	// Show a pulsating animation to bring attention to form changes
	// trigger by setting highlight prop to true, reset by setting to false, then true
	const [animation, setAnimation] = useState('none');
	useEffect(() => {
		if (highlight) {
			setAnimation('highlight 1s linear 0s 2');

			return () => setAnimation('none');
		}
	}, [highlight]);

	const [selectedFiles, setSelectedFiles] = useState<string[]>(Object.keys(inputFiles ?? {}));
	const [selectedCluster, setSelectedCluster] = useState<number | undefined>(0);

	const [simName, setSimName] = useState(editorJson?.project.title ?? '');
	const [nTasks, setNTasks] = useState(1);
	const [arrayHeader, setArrayHeader] = useState<string>('');
	const [collectHeader, setCollectHeader] = useState<string>('');
	const [arrayOptions, setArrayOptions] = useState<ScriptOption[]>([]);
	const [collectOptions, setCollectOptions] = useState<ScriptOption[]>([]);
	const [selectedScriptParamsTab, setSelectedScriptParamsTab] = useState(0);
	const { isConverterReady } = usePythonConverter();
	const [runPreconditionsMet, setRunPreconditionsMet] = useState(false);

	useEffect(() => {
		const runFormIsValid = !isNaN(nTasks) && !isNaN(overridePrimariesCount);
		const converterReadyIfGeant4Selected =
			currentSimulator !== SimulatorType.GEANT4 || isConverterReady;

		const datasetsReady =
			currentSimulator !== SimulatorType.GEANT4 ||
			geant4DatasetType === Geant4DatasetsType.LAZY ||
			geant4DownloadManagerState === DownloadManagerStatus.FINISHED;

		setRunPreconditionsMet(runFormIsValid && converterReadyIfGeant4Selected && datasetsReady);
	}, [
		nTasks,
		overridePrimariesCount,
		currentSimulator,
		isConverterReady,
		geant4DatasetType,
		geant4DownloadManagerState
	]);

	const toggleFileSelection = (fileName: string) =>
		setSelectedFiles((prev: string[]) => {
			return prev.includes(fileName) ? prev.filter(f => f !== fileName) : [...prev, fileName];
		});

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

		if (newSourceType === 'files') {
			setSelectedFiles(Object.keys(inputFiles ?? {}));
		}
	};

	const handleParamsTabChange = (event: SyntheticEvent, newValue: number) => {
		setSelectedScriptParamsTab(newValue);
	};

	const handleRunSimulationClick = () => {
		if (!runPreconditionsMet) {
			return;
		}

		const filteredInputFiles = Object.entries(inputFiles ?? {}).reduce((acc, [key, value]) => {
			if (selectedFiles.includes(key)) {
				return { ...acc, [key]: value };
			}

			return acc;
		}, {});

		const batchOptions = {
			clusterName: availableClusters[selectedCluster ?? 0],
			arrayHeader,
			arrayOptions,
			collectHeader,
			collectOptions
		};

		if (editorJson && simulationSourceType)
			editorJson.beam.numberOfParticles = overridePrimariesCount;

		setSource(currentSimulator === SimulatorType.GEANT4 ? 'local' : 'remote');

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

	const simulatorMenuItems = Array.from(runSimulatorOptions).map(simulator => (
		<MenuItem
			key={simulator}
			value={simulator}>
			{SimulatorNames.get(simulator)}
		</MenuItem>
	));

	return (
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
					textTransform='none'
					fontSize={16}>
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
				{currentSimulator !== SimulatorType.GEANT4 ? (
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
							disabled={currentSimulator === SimulatorType.GEANT4}
							error={isNaN(nTasks)}
							value={currentSimulator === SimulatorType.GEANT4 ? 1 : nTasks}
							onChange={e => setNTasks(Math.max(1, parseInt(e.target.value)))}
						/>
						<TextField
							size='small'
							type='number'
							label='Number of primary particles'
							error={isNaN(overridePrimariesCount)}
							value={overridePrimariesCount}
							onChange={e =>
								setOverridePrimariesCount(Math.max(1, parseInt(e.target.value)))
							}
						/>
						<FormControl
							fullWidth
							disabled={runSimulatorOptions.length < 2}>
							<InputLabel id='simulator-select-label'>Simulation software</InputLabel>
							<Select
								labelId='simulator-select-label'
								size='small'
								label='Simulation software'
								value={runSimulator}
								onChange={evn =>
									setRunSimulator(evn.target.value as SimulatorType)
								}>
								{simulatorMenuItems}
							</Select>
						</FormControl>
						<StyledExclusiveToggleButtonGroup
							fullWidth
							value={simulationSourceType}
							onChange={handleSourceTypeChange}>
							<ToggleButton value='editor'>Editor Project Data</ToggleButton>
							<ToggleButton
								value='files'
								disabled={!inputFiles}>
								Input Files Data
							</ToggleButton>
						</StyledExclusiveToggleButtonGroup>
						{inputFiles && (
							<Button
								size='small'
								onClick={clearInputFiles}
								sx={{
									alignSelf: 'end',
									marginTop: theme.spacing(-1),
									marginBottom: theme.spacing(1)
								}}>
								Clear
							</Button>
						)}
						{inputFiles && (
							<Box
								sx={{
									display: 'flex',
									gap: 1,
									flexWrap: 'wrap',
									justifyContent: 'center',
									marginBottom: theme.spacing(2)
								}}>
								{Object.keys(inputFiles ?? {}).map((fileName, index) => (
									<Chip
										key={index}
										color={
											selectedFiles.includes(fileName) ? 'success' : 'default'
										}
										variant='outlined'
										label={<Typography>{fileName}</Typography>}
										deleteIcon={
											selectedFiles.includes(fileName) ? (
												<RemoveCircleIcon />
											) : (
												<ControlPointIcon />
											)
										}
										onDelete={() => toggleFileSelection(fileName)}
									/>
								))}
							</Box>
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
				{currentSimulator === SimulatorType.GEANT4 && (
					<StyledExclusiveToggleButtonGroup
						fullWidth
						value={geant4DatasetType}
						onChange={(_, newRunType) =>
							setGeant4DatasetType(newRunType || Geant4DatasetsType.LAZY)
						}>
						<ToggleButton value={Geant4DatasetsType.LAZY}>Lazy files</ToggleButton>
						<ToggleButton value={Geant4DatasetsType.DOWNLOADED}>
							Downloadable
						</ToggleButton>
					</StyledExclusiveToggleButtonGroup>
				)}
				<Box sx={{ display: 'flex', justifyContent: 'center' }}>
					<Button
						sx={{
							height: '36px',
							width: '180px'
						}}
						variant='contained'
						size='large'
						disabled={!usingBatchConfig && !runPreconditionsMet}
						onClick={handleRunSimulationClick}>
						Start simulation
					</Button>
				</Box>
			</AccordionDetails>
		</StyledAccordion>
	);
}
