import LoadingButton from '@mui/lab/LoadingButton';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import { throttle } from 'throttle-debounce';

import { usePythonConverter } from '../../../PythonConverter/PythonConverterService';
import { readFile } from '../../../services/LoaderService';
import { useStore } from '../../../services/StoreService';
import { addCustomStoppingPowerTableToEditorJSON } from '../../../ThreeEditor/Simulation/CustomStoppingPower/CustomStoppingPower';
import { SimulatorType } from '../../../types/RequestTypes';
import {
	_defaultFlukaInputFiles,
	_defaultShInputFiles,
	_defaultTopasInputFiles,
	SimulationInputFiles
} from '../../../types/ResponseTypes';
import { DragDropFiles } from './DragDropFiles';
import { InputFilesEditor } from './InputFilesEditor';

interface InputEditorPanelProps {
	goToRun?: (simulator: SimulatorType, InputFiles?: SimulationInputFiles) => void;
	simulator: SimulatorType;
	onSimulatorChange: (newSimulator: SimulatorType) => void;
}

export default function InputEditorPanel({
	goToRun,
	simulator,
	onSimulatorChange
}: InputEditorPanelProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { yaptideEditor } = useStore();
	const { isConverterReady, convertJSON } = usePythonConverter();

	const [isInProgress, setInProgress] = useState(false);
	const [inputFiles, setInputFiles] = useState<SimulationInputFiles>(_defaultShInputFiles);
	const [controller] = useState(new AbortController());

	const onClickGenerate = useCallback(async () => {
		if (simulator === SimulatorType.COMMON) {
			return enqueueSnackbar('Please select simulator', { variant: 'warning' });
		}

		setInProgress(true);
		const editorJSON = yaptideEditor?.toSerialized();

		if (!editorJSON) return setInProgress(false);

		await addCustomStoppingPowerTableToEditorJSON(editorJSON);

		convertJSON(editorJSON, simulator)
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
	}, [yaptideEditor, enqueueSnackbar, controller.signal, convertJSON, simulator]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedOnClickGenerate = useCallback(
		throttle(1000, onClickGenerate, { noTrailing: true }),
		[onClickGenerate]
	);

	let acceptedFiles = '';

	switch (simulator) {
		case SimulatorType.SHIELDHIT:
			acceptedFiles = '.dat';

			break;
		// In current version of yaptide, topas is not supported
		// case SimulatorType.TOPAS:
		// 	acceptedFiles = '.txt';
		// 	break;
		case SimulatorType.FLUKA:
			acceptedFiles = '.inp';

			break;
		default:
			acceptedFiles = '';
	}

	return (
		<Box
			sx={{
				margin: '0 auto',
				width: '100%',
				padding: '3rem',
				gap: '1.5rem',
				minHeight: '100vh',
				height: 'min-content',
				boxSizing: 'border-box'
			}}>
			<Box
				sx={{
					marginBottom: '2rem'
				}}>
				<LoadingButton
					id='generate-from-editor'
					sx={{
						marginRight: '1rem'
					}}
					color='info'
					loading={!isConverterReady}
					variant='contained'
					onClick={debouncedOnClickGenerate}
					disabled={isInProgress}
					loadingIndicator='Initializing...'>
					Generate from Editor
				</LoadingButton>
				<ToggleButtonGroup
					sx={{
						marginLeft: '1rem'
					}}
					value={simulator}
					exclusive
					onChange={(_e, chosenSimulator) => {
						if (chosenSimulator) {
							if (chosenSimulator !== simulator)
								if (
									window.confirm(
										'Current input files will be lost. Are you sure?'
									)
								) {
									onSimulatorChange(chosenSimulator);

									switch (chosenSimulator) {
										case SimulatorType.SHIELDHIT:
											setInputFiles(_defaultShInputFiles);

											break;
										// Topas is not supported in current version of yaptide
										// case SimulatorType.TOPAS:
										// 	setInputFiles(_defaultTopasInputFiles);
										// 	break;
										case SimulatorType.FLUKA:
											setInputFiles(_defaultFlukaInputFiles);

											break;
										default:
											throw new Error(
												'Unknown simulator: ' + chosenSimulator
											);
									}
								}
						}
					}}>
					<ToggleButton
						value={SimulatorType.SHIELDHIT}
						color='info'>
						SHIELD-HIT12A
					</ToggleButton>
					{/* <ToggleButton
						value={SimulatorType.TOPAS}
						color='info'>
						TOPAS
					</ToggleButton> */}
					<ToggleButton
						value={SimulatorType.FLUKA}
						color='info'>
						Fluka
					</ToggleButton>
				</ToggleButtonGroup>
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

			<InputFilesEditor
				simulator={simulator}
				inputFiles={inputFiles}
				onChange={inputFiles => setInputFiles(inputFiles)}
			/>
		</Box>
	);
}
