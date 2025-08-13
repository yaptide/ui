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
	ToggleButtonGroup,
	useTheme
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { MouseEvent, SyntheticEvent, useEffect, useState } from 'react';

import StyledAccordion from '../../../shared/components/StyledAccordion';
import { StyledTab, StyledTabs } from '../../../shared/components/Tabs/StyledTabs';
import { EditorJson } from '../../../ThreeEditor/js/EditorJson';
import { SimulatorNames, SimulatorType } from '../../../types/RequestTypes';
import { SimulationInputFiles } from '../../../types/ResponseTypes';
import { BatchScriptParametersEditor } from './BatchParametersEditor';

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
	batchOptions: BatchOptionsType
) => void;

type RunSimulationFormProps = {
	availableClusters?: string[];
	editorJson?: EditorJson;
	inputFiles?: Partial<SimulationInputFiles>;
	forwardedSimulator: SimulatorType;
	runSimulation?: RunSimulationFunctionType;
};

export function RunSimulationForm({
	availableClusters = ['default'],
	editorJson,
	inputFiles = {},
	forwardedSimulator,
	runSimulation = () => {}
}: RunSimulationFormProps) {
	const theme = useTheme();
	const [usingBatchConfig, setUsingBatchConfig] = useState(false);
	const [simulationRunType, setSimulationRunType] = useState<SimulationRunType>('direct');
	const [simulationSourceType, setSimulationSourceType] = useState<SimulationSourceType>(
		Object.keys(inputFiles).length > 0 ? 'files' : 'editor'
	);
	const [highlight, setHighlight] = useState(false);

	useEffect(() => {
		if (Object.keys(inputFiles).length > 0) {
			console.log('new input files');
			setSimulationSourceType('files');
			setSelectedFiles(Object.keys(inputFiles));
			setHighlight(true);
			setTimeout(() => setHighlight(false), 2500);
		}
	}, [inputFiles]);

	const [selectedFiles, setSelectedFiles] = useState<string[]>(Object.keys(inputFiles));
	const [selectedCluster, setSelectedCluster] = useState<number | undefined>(0);

	const [simName, setSimName] = useState(editorJson?.project.title ?? '');
	const [nTasks, setNTasks] = useState(1);
	const [simulator, setSelectedSimulator] = useState<SimulatorType>(forwardedSimulator);
	const [arrayHeader, setArrayHeader] = useState<string>('');
	const [collectHeader, setCollectHeader] = useState<string>('');
	const [arrayOptions, setArrayOptions] = useState<ScriptOption[]>([]);
	const [collectOptions, setCollectOptions] = useState<ScriptOption[]>([]);
	const [selectedScriptParamsTab, setSelectedScriptParamsTab] = useState(0);

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
			setSelectedFiles(Object.keys(inputFiles));
		}
	};

	const handleParamsTabChange = (event: SyntheticEvent, newValue: number) => {
		setSelectedScriptParamsTab(newValue);
	};

	const handleRunSimulationClick = () => {
		const filteredInputFiles = Object.entries(inputFiles).reduce((acc, [key, value]) => {
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
			runSimulation(
				simulationRunType,
				editorJson,
				filteredInputFiles,
				simulationSourceType,
				simName,
				nTasks,
				simulator,
				batchOptions
			);
	};

	const simulatorMenuItems = Array.from(SimulatorNames.entries()).map(
		([simulatorType, simulatorName]) => (
			<MenuItem
				key={simulatorType}
				value={simulatorType}>
				{simulatorName}
			</MenuItem>
		)
	);

	const isSimulatorChoiceDisabled = forwardedSimulator !== SimulatorType.COMMON;
	const defaultSimulator = isSimulatorChoiceDisabled
		? forwardedSimulator
		: simulatorMenuItems[0].props.value;

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
				'animation': highlight ? 'highlight 1s linear 0s 2' : 'none'
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
					'& .MuiToggleButtonGroup-root, & .MuiFormControl-root': {
						marginBottom: theme.spacing(2)
					}
				}}>
				<ToggleButtonGroup
					exclusive
					fullWidth
					value={simulationRunType}
					onChange={handleRunTypeChange}>
					<ToggleButton
						size='small'
						value='direct'>
						Direct Run
					</ToggleButton>
					<ToggleButton
						size='small'
						color='info'
						value='batch'>
						Batch Run
					</ToggleButton>
				</ToggleButtonGroup>
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
							value={nTasks}
							onChange={e => setNTasks(Math.max(1, parseInt(e.target.value)))}
						/>
						<FormControl
							fullWidth
							disabled={isSimulatorChoiceDisabled}>
							<InputLabel id='simulator-select-label'>Simulation software</InputLabel>
							<Select
								labelId='simulator-select-label'
								size='small'
								label='Simulation software'
								defaultValue={defaultSimulator}
								onChange={evn =>
									setSelectedSimulator(evn.target.value as SimulatorType)
								}>
								{simulatorMenuItems}
							</Select>
						</FormControl>
						<ToggleButtonGroup
							exclusive
							fullWidth
							value={simulationSourceType}
							onChange={handleSourceTypeChange}>
							<ToggleButton
								size='small'
								value='editor'
								color='primary'>
								Editor Project Data
							</ToggleButton>
							<ToggleButton
								size='small'
								value='files'
								color='success'
								disabled={Object.keys(inputFiles).length === 0}>
								Input Files Data
							</ToggleButton>
						</ToggleButtonGroup>
						<Box
							sx={{
								display: 'flex',
								gap: 1,
								flexWrap: 'wrap',
								justifyContent: 'center',
								marginBottom: theme.spacing(2)
							}}>
							{Object.keys(inputFiles).map((fileName, index) => (
								<Chip
									key={index}
									color={selectedFiles.includes(fileName) ? 'success' : 'default'}
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
				<Box sx={{ display: 'flex', justifyContent: 'center' }}>
					<Button
						sx={{
							height: '36px',
							width: '180px'
						}}
						size='large'
						onClick={handleRunSimulationClick}>
						Start simulation
					</Button>
				</Box>
			</AccordionDetails>
		</StyledAccordion>
	);
}
