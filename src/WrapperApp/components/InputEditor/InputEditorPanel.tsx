import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { PythonConverterService2 } from '../../../PythonConverter/PythonConverterService2';
import { InputFiles, useShSimulation } from '../../../services/ShSimulatorService';
import { useStore } from '../../../services/StoreService';
import { InputFilesEditor } from './InputFilesEditor';

interface InputEditorPanelProps {
	goToRun?: () => void;
}

export default function InputEditorPanel(props: InputEditorPanelProps) {
	const { editorRef } = useStore();
	const { convertToInputFiles, sendRun } = useShSimulation();

	const [isInProgress, setInProgress] = useState(false);
	const [inputFiles, setInputFiles] = useState<InputFiles>();

	const [controller] = useState(new AbortController());

	const onClickGenerate = () => {
		setInProgress(true);
		convertToInputFiles(editorRef.current?.toJSON(), controller.signal)
			.then(res => {
				setInputFiles({ ...res.content.input_files });
			})
			.catch()
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
		<PythonConverterService2>
			<Box
				sx={{
					margin: '0 auto',
					width: '100%',
					padding: '3rem',
					gap: '1.5rem',
					height: 'min-content'
				}}>
				<Button
					variant='contained'
					onClick={onClickGenerate}
					disabled={isInProgress}
					sx={{
						marginBottom: '2rem'
					}}>
					Generate from Editor
				</Button>
				<InputFilesEditor inputFiles={inputFiles} runSimulation={runSimulation} />
			</Box>
		</PythonConverterService2>
	);
}
