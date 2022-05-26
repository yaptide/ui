import { Box, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { type } from 'os';
import { useEffect, useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import {
	PythonConverterService,
	usePythonConverter
} from '../../../PythonConverter/PythonConverterService';
import { InputFiles, useShSimulation } from '../../../services/ShSimulatorService';
import { useStore } from '../../../services/StoreService';
import { InputFilesEditor } from './InputFilesEditor';

interface InputEditorPanelProps {
	goToRun?: () => void;
}

type GeneratorLocation = 'local' | 'remote';

export default function InputEditorPanel(props: InputEditorPanelProps) {
	const { editorRef } = useStore();
	const { convertToInputFiles, sendRun } = useShSimulation();
	const { pyodide, convertJSON } = usePythonConverter();

	const [isInProgress, setInProgress] = useState(false);
	const [inputFiles, setInputFiles] = useState<InputFiles>();
	const [generator, setGenerator] = useState<GeneratorLocation>('local');

	const [controller] = useState(new AbortController());

	const handleConvert = async (editorJSON: object) => {
		switch (generator) {
			case 'remote':
				return convertToInputFiles(editorJSON, controller.signal).then(res => {
					return res.content.input_files;
				});
			case 'local':
				return convertJSON(editorJSON).then(res => Object.fromEntries(res) as unknown as InputFiles);
			default:
				throw new Error('Unknown generator: ' + generator);
		}
	};

	const onClickGenerate = () => {
		setInProgress(true);
		const editorJSON = editorRef.current?.toJSON();
		if (!editorJSON) return setInProgress(false);

		handleConvert(editorJSON)
			.then(inputFiles => {
				setInputFiles({ ...inputFiles });
			})
			.catch(e => {
				console.error(e);
			})
			.finally(() => {
				setInProgress(false);
			});
	};

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
					loading={generator === 'local' && !pyodide}
					variant='contained'
					onClick={onClickGenerate}
					disabled={isInProgress}
					loadingIndicator='Initializing...'>
					Generate from Editor
				</LoadingButton>

				<ToggleButtonGroup
					color='primary'
					value={generator}
					exclusive
					onChange={(_e, generator) => setGenerator(generator)}>
					<ToggleButton value='local'>Local</ToggleButton>
					<ToggleButton value='remote'>Remote</ToggleButton>
				</ToggleButtonGroup>
			</Box>
			<InputFilesEditor inputFiles={inputFiles} runSimulation={runSimulation} />
		</Box>
	);
}
