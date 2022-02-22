import { Box, Button, Card, CardActions, CardContent } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { InputFiles } from '../../../services/ShSimulatorService';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { saveString } from '../../../util/File';

interface InputFilesEditorProps {
	inputFiles?: InputFiles;
	runSimulation?: (inputFiles: InputFiles) => void;
	saveAndExit?: (inputFiles: InputFiles) => void;
	closeEditor?: () => void;
	innerState?: boolean;
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

	useEffect(() => {
		if (!props.innerState) setInputFiles({ ...(props.inputFiles ?? _emptyInputFiles) });
	}, [props.innerState, props.inputFiles]);
	

	return (
		<Card sx={{ minHeight: '100%' }}>
			<CardActions sx={{ justifyContent: 'flex-end' }}>
				{props.runSimulation && (
					<Button
						color='success'
						variant='contained'
						onClick={() => props.runSimulation?.call(null, inputFiles)}>
						Run input files
					</Button>
				)}
				<Button
					onClick={() =>
						Object.entries(inputFiles).map(([name, value]) => saveString(value, name))
					}>
					Download all
				</Button>
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
							<h2>
								{name}
								<Button
									onClick={() => {
										saveString(value, name);
									}}>
									Download
								</Button>
							</h2>
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
