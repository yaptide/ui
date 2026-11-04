import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, ListItemText, Menu, MenuItem, Typography, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import { throttle } from 'throttle-debounce';

import { usePythonConverter } from '../../../PythonConverter/PythonConverterService';
import { useInputFiles } from '../../../services/InputFilesContextProvider';
import { readFile } from '../../../services/LoaderService';
import { useStore } from '../../../services/StoreService';
import { addCustomStoppingPowerTableToEditorJSON } from '../../../ThreeEditor/Simulation/CustomStoppingPower/CustomStoppingPower';
import { SimulatorNames, SimulatorType } from '../../../types/RequestTypes';
import { DragDropFiles } from './DragDropFiles';
import { InputFilesEditor } from './InputFilesEditor';
import { inputFilesZipName, saveInputFilesAsZip } from './saveInputFiles';
import { emptyFiles, InputFiles, RUNNABLE_SIMULATORS, simulatorName } from './simulatorDetection';

export default function InputEditorPanel() {
	const { enqueueSnackbar } = useSnackbar();
	const { yaptideEditor } = useStore();
	const { isConverterReady, convertJSON } = usePythonConverter();
	const {
		inputFiles,
		selectedFiles,
		detection,
		requiredFiles,
		addFiles,
		updateFile,
		removeFile,
		renameFile,
		toggleSelected
	} = useInputFiles();
	const theme = useTheme();

	const [isInProgress, setInProgress] = useState(false);
	const [generateMenuAnchor, setGenerateMenuAnchor] = useState<HTMLElement | null>(null);
	const [emptyMenuAnchor, setEmptyMenuAnchor] = useState<HTMLElement | null>(null);

	const editorSimulator = yaptideEditor?.contextManager.currentSimulator ?? SimulatorType.COMMON;
	const canChooseSimulatorToGenerate = editorSimulator === SimulatorType.COMMON;
	const hasInputFiles = Object.keys(inputFiles).length > 0;

	const generate = useCallback(
		async (simulator: SimulatorType) => {
			setInProgress(true);
			const editorJSON = yaptideEditor?.toSerialized();

			if (!editorJSON) return setInProgress(false);

			await addCustomStoppingPowerTableToEditorJSON(editorJSON);

			convertJSON(editorJSON, simulator)
				.then(res => Object.fromEntries(res) as InputFiles)
				.then(async generatedFiles => {
					if (
						await addFiles(
							generatedFiles,
							'replace',
							`Generating ${SimulatorNames.get(simulator)} files from the editor`
						)
					)
						enqueueSnackbar('Input files generated', { variant: 'info' });
				})
				.catch(e => {
					enqueueSnackbar('Error while converting input files', { variant: 'error' });
					console.error(e);
				})
				.finally(() => {
					setInProgress(false);
				});
		},
		[yaptideEditor, enqueueSnackbar, convertJSON, addFiles]
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const throttledGenerate = useCallback(throttle(1000, generate, { noTrailing: true }), [
		generate
	]);

	const uploadFiles = (files: FileList | undefined) => {
		if (!files) return;

		Promise.all(
			Array.from(files).map(
				async file => [file.name, (await readFile(file)) as string] as const
			)
		).then(entries => addFiles(Object.fromEntries(entries), 'add', 'Uploading files'));
	};

	return (
		<Box
			sx={{
				padding: theme.spacing(1),
				gap: theme.spacing(1),
				height: 'min-content',
				boxSizing: 'border-box'
			}}>
			<Box
				sx={{
					marginBottom: theme.spacing(1),
					padding: theme.spacing(2),
					boxSizing: 'border-box'
				}}>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 2,
						marginBottom: theme.spacing(2)
					}}>
					<LoadingButton
						id='generate-from-editor'
						color='primary'
						loading={!isConverterReady}
						variant='contained'
						endIcon={canChooseSimulatorToGenerate ? <ArrowDropDownIcon /> : undefined}
						onClick={event =>
							canChooseSimulatorToGenerate
								? setGenerateMenuAnchor(event.currentTarget)
								: throttledGenerate(editorSimulator)
						}
						disabled={isInProgress}
						loadingIndicator='Initializing...'>
						Generate from Editor
					</LoadingButton>
					<Menu
						anchorEl={generateMenuAnchor}
						open={generateMenuAnchor !== null}
						onClose={() => setGenerateMenuAnchor(null)}>
						{[SimulatorType.SHIELDHIT, SimulatorType.FLUKA].map(simulator => (
							<MenuItem
								key={simulator}
								onClick={() => {
									setGenerateMenuAnchor(null);
									throttledGenerate(simulator);
								}}>
								{SimulatorNames.get(simulator)}
							</MenuItem>
						))}
					</Menu>
					<Button
						variant='outlined'
						endIcon={<ArrowDropDownIcon />}
						disabled={!requiredFiles}
						onClick={event => setEmptyMenuAnchor(event.currentTarget)}>
						Create empty files
					</Button>
					<Menu
						anchorEl={emptyMenuAnchor}
						open={emptyMenuAnchor !== null}
						onClose={() => setEmptyMenuAnchor(null)}>
						{RUNNABLE_SIMULATORS.map(simulator => (
							<MenuItem
								key={simulator}
								onClick={() => {
									setEmptyMenuAnchor(null);
									addFiles(
										emptyFiles(requiredFiles?.[simulator] ?? []),
										'replace',
										`Creating empty ${simulatorName(simulator)} files`
									);
								}}>
								<ListItemText
									primary={simulatorName(simulator)}
									secondary={requiredFiles?.[simulator].join(', ')}
								/>
							</MenuItem>
						))}
					</Menu>
					<Button
						color='info'
						sx={{ marginLeft: 'auto' }}
						disabled={!hasInputFiles}
						onClick={() =>
							saveInputFilesAsZip(
								inputFiles,
								inputFilesZipName(
									yaptideEditor?.config.getKey('project/title'),
									inputFiles,
									detection
								)
							)
						}>
						Download all
					</Button>
				</Box>

				<DragDropFiles
					id={'input-file-upload-editor'}
					onSubmit={uploadFiles}
					acceptedFiles=''
				/>
			</Box>

			{hasInputFiles ? (
				<InputFilesEditor
					inputFiles={inputFiles}
					detection={detection}
					requiredFiles={requiredFiles}
					selectedFiles={selectedFiles}
					onToggleSelected={toggleSelected}
					onChange={updateFile}
					onRemove={removeFile}
					onRename={renameFile}
				/>
			) : (
				<Typography
					color='textSecondary'
					sx={{ textAlign: 'center', padding: theme.spacing(4) }}>
					No input files yet. Generate them from the editor, upload them or create empty
					ones.
				</Typography>
			)}
		</Box>
	);
}
