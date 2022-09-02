import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useState, useCallback } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { usePythonConverter } from '../../../PythonConverter/PythonConverterService';
import { InputFiles, useShSimulation } from '../../../services/ShSimulatorService';
import { useStore } from '../../../services/StoreService';
import { InputFilesEditor } from './InputFilesEditor';
import { DEMO_MODE } from '../../../util/Config';
import { useSnackbar } from 'notistack';
import { throttle } from 'throttle-debounce';

interface InputEditorPanelProps {
	goToRun?: () => void;
}

type GeneratorLocation = 'local' | 'remote';

export default function InputEditorPanel(props: InputEditorPanelProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { editorRef } = useStore();
	const { convertToInputFiles, sendRun } = useShSimulation();
	const { isConverterReady, convertJSON } = usePythonConverter();

	const [isInProgress, setInProgress] = useState(false);
	const [inputFiles, setInputFiles] = useState<InputFiles>();
	const [generator, setGenerator] = useState<GeneratorLocation>('local');

	const [controller] = useState(new AbortController());

	const handleConvert = useCallback(
		async (editorJSON: object) => {
			switch (generator) {
				case 'remote':
					return convertToInputFiles(editorJSON, controller.signal).then(res => {
						return res.content.input_files;
					});
				case 'local':
					return convertJSON(editorJSON).then(
						res => Object.fromEntries(res) as unknown as InputFiles
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

	const runSimulation = (inputFiles: InputFiles) => {
		setInProgress(true);
		const input = { inputFiles };
		sendRun(input, controller.signal)
			.then()
			.catch()
			.finally(() => {
				setInProgress(false);
				props.goToRun?.call(null);
			});
	};

	return (
		<Box
			sx={{
				margin: '0 auto',
				width: '100%',
				padding: '3rem',
				gap: '1.5rem',
				height: 'min-content'
			}}>
			<Box
				sx={{
					marginBottom: '2rem'
				}}>
				<LoadingButton
					sx={{
						marginRight: '1rem'
					}}
					loading={generator === 'local' && !isConverterReady}
					variant='contained'
					onClick={debouncedOnClickGenerate}
					disabled={isInProgress}
					loadingIndicator='Initializing...'>
					Generate from Editor
				</LoadingButton>

				<ToggleButtonGroup
					color='primary'
					value={generator}
					exclusive
					onChange={(_e, generator) => {
						if (generator) setGenerator(generator);
					}}>
					<ToggleButton value='local'>Local</ToggleButton>
					{!DEMO_MODE && <ToggleButton value='remote'>Remote</ToggleButton>}
				</ToggleButtonGroup>
			</Box>
			<InputFilesEditor
				inputFiles={inputFiles}
				runSimulation={!DEMO_MODE ? runSimulation : undefined}
			/>
		</Box>
	);
}
