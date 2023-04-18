import {
	Box,
	Tabs,
	Tab,
	Switch,
	TextField,
	ButtonGroup,
	ToggleButtonGroup,
	ToggleButton,
	Select,
	SelectChangeEvent,
	MenuItem,
	InputLabel,
	FormControl,
	useTheme,
	CardActions,
	Button
} from '@mui/material';
import { TabPanel } from '../Panels/TabPanel';
import { ChangeEvent, useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { Chip } from '@mui/material';
import { EditorJson } from '../../../ThreeEditor/js/EditorJson';
import { InputFiles } from '../../../services/ResponseTypes';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { BatchScriptParametersEditor } from './BatchParametersEditor';

function a11yProps(index: number, name: string = 'RunSimulation') {
	return {
		'id': `${name}Tab${index}`,
		'aria-controls': `${name}Tabpanel${index}`
	};
}

export type SimulationRunType = 'direct' | 'batch';
export type SimulationSourceType = 'project' | 'files';
export type ScriptOption = {
	optionKey: string;
	optionLabel?: string;
	optionValue: string;
};
export type BatchOptionsType = {
	clusterName?: string;
	arrayOptions?: ScriptOption[];
	arrayHeader?: string;
	collectOptions?: ScriptOption[];
	collectHeader?: string;
};

type RunSimulationFormProps = {
	availableClusters: string[];
	editorJson: EditorJson;
	inputFiles?: Partial<InputFiles>;
	runSimulation?: (
		editorJson: EditorJson,
		inputFiles: Partial<InputFiles>,
		runType: SimulationRunType,
		sourceType: SimulationSourceType,
		simName: string,
		nTasks: number,
		simulator: string,
		batchOptions: BatchOptionsType
	) => void;
};

export function RunSimulationForm({
	availableClusters,
	editorJson,
	inputFiles = {},
	runSimulation = () => {}
}: RunSimulationFormProps) {
	const [tabValue, setTabValue] = useState(0);
	const [simulationRunType, setSimulationRunType] = useState<SimulationRunType>('direct');
	const [selectedFiles, setSelectedFiles] = useState<string[]>(Object.keys(inputFiles));
	const [selectedCluster, setSelectedCluster] = useState<number | undefined>(0);

	const handleChangeCluster = (event: SelectChangeEvent) => {
		setSelectedCluster(parseInt(event.target.value));
	};

	const [simulationSourceType, setSimulationSourceType] =
		useState<SimulationSourceType>('project');
	const handleRunTypeChange = (
		event: React.MouseEvent<HTMLElement>,
		newRunType: SimulationRunType | null
	) => {
		if (newRunType === null) return;
		setSimulationRunType(newRunType);
	};
	const handleSourceTypeChange = (
		event: React.MouseEvent<HTMLElement>,
		newSourceType: SimulationSourceType | null
	) => {
		if (newSourceType === null) return;
		setSimulationSourceType(newSourceType);
	};

	const [simName, setSimName] = useState(editorJson.project.title ?? '');
	const [nTasks, setNTasks] = useState(1);
	const [simulator] = useState<string>('shieldhit');
	const [arrayHeader, setArrayHeader] = useState<string>('');
	const [collectHeader, setCollectHeader] = useState<string>('');
	const [selectedScriptParamsTab, setSelectedScriptParamsTab] = useState(0);
	const theme = useTheme();

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};
	const handleParamsTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setSelectedScriptParamsTab(newValue);
	};

	const [arrayOptions, setArrayOptions] = useState<ScriptOption[]>([]);

	const [collectOptions, setCollectOptions] = useState<ScriptOption[]>([]);

	return (
		<Box>
			<Tabs
				value={tabValue}
				onChange={handleTabChange}
				variant='fullWidth'
				sx={{
					'& .MuiTabs-indicator': {
						backgroundColor: ({ palette }) =>
							tabValue === 1 ? palette.info.main : palette.primary.main
					}
				}}>
				<Tab label='General Config' {...a11yProps(0)} />
				<Tab
					sx={{
						'&,&.Mui-selected': {
							color: ({ palette }) =>
								simulationRunType === 'direct'
									? palette.grey[500]
									: palette.info.main
						}
					}}
					disabled={simulationRunType === 'direct'}
					label='Batch Config'
					{...a11yProps(1)}
				/>
			</Tabs>
			<TabPanel value={tabValue} index={0}>
				<Box
					sx={{
						display: 'grid',
						gap: 3,
						width: 'fit-content',
						p: ({ spacing }) => spacing(3, 2, 2, 2)
					}}>
					<ToggleButtonGroup
						sx={{
							maxWidth: ({ spacing }) => `calc(100vw - ${spacing(14)})`,
							width: '380px'
						}}
						exclusive
						fullWidth
						value={simulationRunType}
						onChange={handleRunTypeChange}>
						<ToggleButton size='small' value='direct'>
							Direct Run
						</ToggleButton>
						<ToggleButton size='small' color='info' value='batch'>
							Batch Run
						</ToggleButton>
					</ToggleButtonGroup>
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
					<TextField
						size='small'
						label='Simulation software'
						value={simulator}
						disabled={true}
					/>
					<ToggleButtonGroup
						exclusive
						fullWidth
						value={simulationSourceType}
						onChange={handleSourceTypeChange}>
						<ToggleButton size='small' value='project' color='primary'>
							Editor Project Data
						</ToggleButton>
						<ToggleButton size='small' value='files' color='success' disabled>
							Input Files Data
						</ToggleButton>
					</ToggleButtonGroup>
					<Box
						sx={{
							minHeight: ({ spacing }) => spacing(5)
						}}>
						{simulationSourceType === 'project' ? (
							<Typography
								sx={{
									p: ({ spacing }) => spacing(0, 2)
								}}>
								Project data will be used for simulation run
							</Typography>
						) : (
							<Box
								sx={{
									display: 'flex',
									gap: 1,
									flexWrap: 'wrap',
									justifyContent: 'center'
								}}>
								{Object.keys(inputFiles).map((fileType, index) => (
									<Chip
										key={index}
										color={
											selectedFiles.includes(fileType) ? 'success' : 'default'
										}
										variant='outlined'
										label={<Typography>{fileType}</Typography>}
										deleteIcon={
											selectedFiles.includes(fileType) ? (
												<RemoveCircleIcon />
											) : (
												<ControlPointIcon />
											)
										}
										onDelete={() =>
											setSelectedFiles((prev: string[]) => {
												return prev.includes(fileType)
													? prev.filter(f => f !== fileType)
													: [...prev, fileType];
											})
										}
									/>
								))}
							</Box>
						)}
					</Box>
				</Box>
			</TabPanel>
			<TabPanel value={tabValue} index={1}>
				<Box
					sx={{
						display: 'grid',
						gap: 3,
						width: '100%',
						p: ({ spacing }) => spacing(3, 2, 2, 2)
					}}>
					<FormControl
						fullWidth
						sx={{
							maxWidth: ({ spacing }) => `calc(100vw - ${spacing(14)})`,
							width: '380px'
						}}>
						<InputLabel id='cluster-select-label'>Cluster</InputLabel>
						<Select
							labelId='cluster-select-label'
							label='Cluster'
							value={`${selectedCluster}`}
							onChange={handleChangeCluster}>
							{availableClusters.map((cluster, index) => (
								<MenuItem key={index} value={index}>
									{cluster}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<Tabs value={selectedScriptParamsTab} onChange={handleParamsTabChange}>
						<Tab label='Array Script' {...a11yProps(0, 'BatchScriptParams')} />
						<Tab label='Collect Script' {...a11yProps(1, 'BatchScriptParams')} />
					</Tabs>
					<TabPanel component={Box} value={selectedScriptParamsTab} index={0}>
						<BatchScriptParametersEditor
							scriptHeader={arrayHeader}
							scriptOptions={arrayOptions}
							handleScriptHeaderChange={evn => setArrayHeader(evn.target.value)}
							handleScriptOptionsChange={setArrayOptions}
							scriptName={'array'}
						/>
					</TabPanel>
					<TabPanel value={selectedScriptParamsTab} index={1}>
						<BatchScriptParametersEditor
							scriptHeader={collectHeader}
							scriptOptions={collectOptions}
							handleScriptHeaderChange={evn => setCollectHeader(evn.target.value)}
							handleScriptOptionsChange={setCollectOptions}
							scriptName={'collect'}
						/>
					</TabPanel>
				</Box>
			</TabPanel>
			<CardActions>
				<Button
					color='info'
					sx={{
						width: 'min(300px, 100%)',
						margin: '0 auto'
					}}
					onClick={() => {
						runSimulation(
							editorJson,
							Object.entries(inputFiles).reduce((acc, [key, value]) => {
								if (selectedFiles.includes(key)) {
									return { ...acc, [key]: value };
								}
								return acc;
							}, {}),
							simulationRunType,
							simulationSourceType,
							simName,
							nTasks,
							simulator,
							{
								clusterName: availableClusters[selectedCluster ?? 0],
								arrayHeader,
								arrayOptions,
								collectHeader,
								collectOptions
							}
						);
					}}>
					Start
				</Button>
			</CardActions>
		</Box>
	);
}
