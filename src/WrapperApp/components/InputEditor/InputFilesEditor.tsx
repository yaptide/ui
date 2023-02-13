import { Box, Button, Card, CardActions, CardContent, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { InputFiles } from '../../../services/ShSimulatorService';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { saveString } from '../../../util/File';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/system/useTheme';
import { DEMO_MODE } from '../../../util/Config';
import { maxHeight } from '@mui/system';

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
	const theme = useTheme();
	const [inputFiles, setInputFiles] = useState<InputFiles>(
		props.inputFiles ?? { ..._emptyInputFiles }
	);

	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
	const inputFilesOrder = [
		'info.json',
		'geo.dat',
		'mat.dat',
		'beam.dat',
		'detect.dat',
		'sobp.dat'
	];
	useEffect(() => {
		if (!props.innerState) setInputFiles({ ...(props.inputFiles ?? _emptyInputFiles) });
	}, [props.innerState, props.inputFiles]);

	return (
		<Card sx={{ minHeight: '100%' }}>
			<CardActions
				sx={{
					justifyContent: 'flex-end',
					background: prefersDarkMode
						? theme.palette.grey['800']
						: theme.palette.grey['300']
				}}>
				{props.runSimulation && (
					<Button
						color='success'
						variant='contained'
						disabled={DEMO_MODE}
						onClick={() => props.runSimulation?.call(null, inputFiles)}>
						Run input files
					</Button>
				)}
				<Button
					color='info'
					onClick={() =>
						Object.entries(inputFiles).map(([name, value]) => saveString(value, name))
					}>
					Download all
				</Button>
				{props.saveAndExit && (
					<Button
						disabled={DEMO_MODE}
						color='info'
						onClick={() => props.saveAndExit?.call(null, inputFiles)}>
						Save and exit
					</Button>
				)}
				{props.closeEditor && (
					<Button color='info' onClick={() => props.closeEditor?.call(null)}>
						Close
					</Button>
				)}
			</CardActions>
			<Divider />
			<CardContent>
				{Object.entries(inputFiles)
					.sort(([name1, _1], [name2, _2]) => {
						const index1 = inputFilesOrder.indexOf(name1) + 1;
						const index2 = inputFilesOrder.indexOf(name2) + 1;
						return index1 - index2;
					})
					.map(([name, value]) => {
						return (
							<Box key={name}>
								<h2>
									{name}
									<Button
										color='info'
										disabled={value.trim() === ''}
										onClick={() => {
											saveString(value, name);
										}}
										sx={{ ml: 1 }}>
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
										backgroundColor: prefersDarkMode ? '#121212' : '#f5f5f5',
										fontFamily:
											'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
										maxHeight: name === 'sobp.dat' ? '15rem' : 'unset',
										overflowY: name === 'sobp.dat' ? 'auto' : 'unset'
									}}
								/>
							</Box>
						);
					})}
			</CardContent>
		</Card>
	);
}
