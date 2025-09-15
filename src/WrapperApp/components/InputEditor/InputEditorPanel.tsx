import LoadingButton from '@mui/lab/LoadingButton';
import { Box, ToggleButton, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { throttle } from 'throttle-debounce';

import { usePythonConverter } from '../../../PythonConverter/PythonConverterService';
import { readFile } from '../../../services/LoaderService';
import { useStore } from '../../../services/StoreService';
import { StyledExclusiveToggleButtonGroup } from '../../../shared/components/StyledExclusiveToggleButtonGroup';
import { addCustomStoppingPowerTableToEditorJSON } from '../../../ThreeEditor/Simulation/CustomStoppingPower/CustomStoppingPower';
import { SimulatorType } from '../../../types/RequestTypes';
import {
	_defaultFlukaInputFiles,
	_defaultGeant4Files,
	_defaultShInputFiles,
	SimulationInputFiles
} from '../../../types/ResponseTypes';
import { DragDropFiles } from './DragDropFiles';
import { InputFilesEditor } from './InputFilesEditor';

interface InputEditorPanelProps {
	goToRun: (InputFiles?: SimulationInputFiles) => void;
}

export default function InputEditorPanel({ goToRun }: InputEditorPanelProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { yaptideEditor } = useStore();
	const { isConverterReady, convertJSON } = usePythonConverter();
	const theme = useTheme();

	const setFilesForSimulator = useCallback((simulator: SimulatorType) => {
		switch (simulator) {
			case SimulatorType.SHIELDHIT:
				setInputFiles(_defaultShInputFiles);

				break;
			case SimulatorType.FLUKA:
				setInputFiles(_defaultFlukaInputFiles);

				break;
			case SimulatorType.GEANT4:
				setInputFiles(_defaultGeant4Files);

				break;
			default:
				setInputFiles(_defaultShInputFiles);

				break;
		}
	}, []);

	// When simulator is set to COMMON, user can select which actual simulator to generate files for
	// Otherwise, this value is equal to simulator selected in editor
	const [generateForSimulator, setGenerateForSimulator] = useState(
		yaptideEditor?.contextManager.currentSimulator || SimulatorType.COMMON
	);

	const showSimulatorToGenerateForToggle =
		yaptideEditor?.contextManager.currentSimulator === SimulatorType.COMMON;

	useEffect(() => {
		const currentSimulator =
			yaptideEditor?.contextManager.currentSimulator || SimulatorType.COMMON;
		setGenerateForSimulator(currentSimulator);
		setFilesForSimulator(currentSimulator);
	}, [yaptideEditor]);

	const [isInProgress, setInProgress] = useState(false);
	const [inputFiles, setInputFiles] = useState<SimulationInputFiles>(_defaultShInputFiles);

	const onClickGenerate = useCallback(async () => {
		if (generateForSimulator === SimulatorType.COMMON) {
			return enqueueSnackbar('Please select simulator', { variant: 'warning' });
		}

		setInProgress(true);
		const editorJSON = yaptideEditor?.toSerialized();

		if (!editorJSON) return setInProgress(false);

		await addCustomStoppingPowerTableToEditorJSON(editorJSON);

		convertJSON(editorJSON, generateForSimulator)
			.then(res => Object.fromEntries(res) as unknown as SimulationInputFiles)
			.then(inputFiles => {
				setInputFiles({ ...inputFiles });
				enqueueSnackbar('Input files generated', { variant: 'info' });
			})
			.catch(e => {
				enqueueSnackbar('Error while converting input files', { variant: 'error' });
				console.error(e);
			})
			.finally(() => {
				setInProgress(false);
			});
	}, [yaptideEditor, enqueueSnackbar, convertJSON, generateForSimulator]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedOnClickGenerate = useCallback(
		throttle(1000, onClickGenerate, { noTrailing: true }),
		[onClickGenerate]
	);

	let acceptedFiles;

	switch (generateForSimulator) {
		case SimulatorType.SHIELDHIT:
			acceptedFiles = '.dat';

			break;
		case SimulatorType.FLUKA:
			acceptedFiles = '.inp';

			break;
		case SimulatorType.GEANT4:
			acceptedFiles = '.xml,.mac';

			break;
		default:
			acceptedFiles = '';
	}

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
				<Box sx={{ marginBottom: theme.spacing(2) }}>
					<LoadingButton
						id='generate-from-editor'
						sx={{
							marginRight: '1rem'
						}}
						color='primary'
						loading={!isConverterReady}
						variant='contained'
						onClick={debouncedOnClickGenerate}
						disabled={isInProgress}
						loadingIndicator='Initializing...'>
						Generate from Editor
					</LoadingButton>
					{showSimulatorToGenerateForToggle && (
						<StyledExclusiveToggleButtonGroup
							value={generateForSimulator}
							onChange={(_e, chosenSimulator) => {
								if (!chosenSimulator || chosenSimulator === generateForSimulator) {
									return;
								}

								if (
									!window.confirm(
										'Current input files will be lost. Are you sure?'
									)
								) {
									return;
								}

								setGenerateForSimulator(chosenSimulator);
								setFilesForSimulator(chosenSimulator);
							}}>
							<ToggleButton value={SimulatorType.SHIELDHIT}>
								SHIELD-HIT12A
							</ToggleButton>
							<ToggleButton value={SimulatorType.FLUKA}>Fluka</ToggleButton>
						</StyledExclusiveToggleButtonGroup>
					)}
				</Box>

				<DragDropFiles
					id={'input-file-upload-editor'}
					onSubmit={files => {
						if (!files) return;

						const submitedFiles: Record<string, string> = {};

						const promises = Array.from(files).map(async file => {
							const content = readFile(file) as Promise<string>;
							submitedFiles[file.name] = await content;

							return content;
						});

						Promise.all(promises).then(_ => {
							setInputFiles(oldInput => {
								if (!oldInput) return submitedFiles as SimulationInputFiles;

								const inputFiles = { ...oldInput, ...submitedFiles };

								return inputFiles as SimulationInputFiles;
							});
						});
					}}
					acceptedFiles={acceptedFiles}
				/>
			</Box>

			<InputFilesEditor
				simulator={generateForSimulator}
				inputFiles={inputFiles}
				goToRun={(inputFiles?: SimulationInputFiles) => {
					goToRun(inputFiles);
				}}
				onChange={inputFiles => setInputFiles(inputFiles)}
			/>
		</Box>
	);
}
