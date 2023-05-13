import LoadingButton from '@mui/lab/LoadingButton';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import { throttle } from 'throttle-debounce';
import { usePythonConverter } from '../../../PythonConverter/PythonConverterService';
import { useShSimulation } from '../../../services/ShSimulatorService';
import { useStore } from '../../../services/StoreService';
import { EditorJson } from '../../../ThreeEditor/js/EditorJson';
import { DEMO_MODE } from '../../../config/Config';
import { InputFilesEditor } from './InputFilesEditor';
import { readFile } from '../../../services/DataLoaderService';
import { DragDropFiles } from './DragDropFiles';
import { SimulationInputFiles, _defaultInputFiles } from '../../../types/ResponseTypes';
interface InputEditorPanelProps {
	goToRun?: (InputFiles?: SimulationInputFiles) => void;
}

type GeneratorLocation = 'local' | 'remote';
type Simulator = 'shieldhit' | 'topas' | 'fluka';

export default function InputEditorPanel({ goToRun }: InputEditorPanelProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { editorRef } = useStore();
	const { convertToInputFiles, postJobDirect } = useShSimulation();
	const { isConverterReady, convertJSON } = usePythonConverter();

	const [isInProgress, setInProgress] = useState(false);
	const [inputFiles, setInputFiles] = useState<SimulationInputFiles>(_defaultInputFiles);
	const [generator, setGenerator] = useState<GeneratorLocation>('local');
	const [simulator, setSimulator] = useState<Simulator>('shieldhit');

	const [controller] = useState(new AbortController());

	const handleConvert = useCallback(
		async (editorJSON: EditorJson) => {
			switch (generator) {
				case 'remote':
					return convertToInputFiles(editorJSON, controller.signal).then(res => {
						return res.inputFiles;
					});
				case 'local':
					return convertJSON(editorJSON).then(
						res => Object.fromEntries(res) as unknown as SimulationInputFiles
					);
				default:
					throw new Error('Unknown generator: ' + generator);
			}
		},
		[controller.signal, convertJSON, convertToInputFiles, generator]
	);

	const onClickGenerate = useCallback(() => {
		setInProgress(true);
		const editorJSON = editorRef.current?.toJSON();
		if (!editorJSON) return setInProgress(false);

		handleConvert(editorJSON)
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
	}, [editorRef, enqueueSnackbar, handleConvert]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedOnClickGenerate = useCallback(
		throttle(1000, onClickGenerate, { noTrailing: true }),
		[onClickGenerate]
	);

	/**
	 * @deprecated
	 */
	const runSimulation = (inputFiles: SimulationInputFiles) => {
		setInProgress(true);
		postJobDirect(inputFiles, undefined, undefined, undefined, undefined, controller.signal)
			.then()
			.catch()
			.finally(() => {
				setInProgress(false);
				goToRun?.call(null);
			});
	};

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
					sx={{
						marginRight: '1rem'
					}}
					color='info'
					loading={generator === 'local' && !isConverterReady}
					variant='contained'
					onClick={debouncedOnClickGenerate}
					disabled={isInProgress}
					loadingIndicator='Initializing...'>
					Generate from Editor
				</LoadingButton>

				<ToggleButtonGroup
					value={generator}
					exclusive
					onChange={(_e, generator) => {
						if (generator) setGenerator(generator);
					}}>
					<ToggleButton
						color='info'
						value='local'>
						Local
					</ToggleButton>
					{!DEMO_MODE && (
						<ToggleButton
							value='remote'
							color='warning'>
							Remote
						</ToggleButton>
					)}
				</ToggleButtonGroup>

				<ToggleButtonGroup
					sx={{
						marginLeft: '1rem'
					}}
					value={simulator}
					exclusive
					onChange={(_e, simulator) => {
						if (simulator) setSimulator(simulator);
					}}>
					<ToggleButton
						value='shieldhit'
						color='info'>
						SHIELDHIT-12A
					</ToggleButton>

					<ToggleButton
						value='topas'
						color='info'>
						TOPAS
					</ToggleButton>

					<ToggleButton
						value='fluka'
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
				acceptedFiles={'.dat'}
			/>

			<InputFilesEditor
				inputFiles={inputFiles}
				onChange={inputFiles => setInputFiles(inputFiles)}
				runSimulation={!DEMO_MODE ? goToRun : undefined}
			/>
		</Box>
	);
}
