import { Box, Button, Card, CardActions, CardContent } from '@mui/material';
import React, { useState } from 'react';
import { InputFiles } from '../../../services/ShSimulationService';
import CodeEditor from '@uiw/react-textarea-code-editor';

interface InputFilesEditorProps {
	inputFiles?: InputFiles;
	runSimulation?: (inputFiles: InputFiles) => void;
	saveAndExit?: (inputFiles: InputFiles) => void;
	closeEditor?: () => void;
}

const _emptyInputFiles: InputFiles = {
	'geo.dat': '',
	'beam.dat': '',
	'detect.dat': '',
	'mat.dat': ''
};
export function InputFilesEditor(props: InputFilesEditorProps) {
	const [inputFiles, setInputFiles] = useState<InputFiles>(
		props.inputFiles ?? { ..._emptyInputFiles }
	);

	return (
		<Card>
			<CardActions sx={{ justifyContent: 'flex-end' }}>
				{props.runSimulation && (
					<Button
						color='success'
						onClick={() => props.runSimulation?.call(null, inputFiles)}>
						Run input files
					</Button>
				)}
				{props.saveAndExit && (
					<Button onClick={() => props.saveAndExit?.call(null, inputFiles)}>
						Save and exit
					</Button>
				)}
				{props.closeEditor && (
					<Button onClick={() => props.closeEditor?.call(null)}>Close</Button>
				)}
			</CardActions>
			<CardContent>
				{Object.entries(inputFiles).map(([name, value]) => {
					return (
						<Box key={name}>
							<h2>{name}</h2>
							<CodeEditor
								value={value}
								language='sql'
								placeholder={`Please enter ${name} content.`}
								onChange={evn =>
									setInputFiles(old => {
										return { ...old, [name]: evn.target.value };
									})
								}
								padding={15}
								style={{
									fontSize: 12,
									backgroundColor: '#f5f5f5',
									fontFamily:
										'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace'
								}}
							/>
						</Box>
					);
				})}
			</CardContent>
		</Card>
	);
}
