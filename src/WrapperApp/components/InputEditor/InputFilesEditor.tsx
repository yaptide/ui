import { Box, Button, Checkbox, Chip, FormControlLabel, Typography } from '@mui/material';
import useTheme from '@mui/system/useTheme';
import CodeEditor from '@uiw/react-textarea-code-editor';

import { saveInputFile } from './saveInputFiles';
import {
	InputFiles,
	RequiredInputFiles,
	SimulatorDetection,
	simulatorName,
	sortInputFileNames
} from './simulatorDetection';

interface InputFilesEditorProps {
	inputFiles: InputFiles;
	onChange: (name: string, content: string) => void;
	detection?: SimulatorDetection;
	requiredFiles?: RequiredInputFiles;
	selectedFiles?: string[];
	onToggleSelected?: (name: string) => void;
	onClear?: (name: string) => void;
	onRemove?: (name: string) => void;
	onRename?: (from: string, to: string) => void;
}

export function InputFilesEditor({
	inputFiles,
	onChange,
	detection,
	requiredFiles,
	selectedFiles,
	onToggleSelected,
	onClear = name => onChange(name, ''),
	onRemove,
	onRename
}: InputFilesEditorProps) {
	const theme = useTheme();
	const largeFileSize = 100_000;
	const largeFileLinesLimit = 500;

	const truncateFile = (file: string) => {
		var result: string[] = [];
		var lines = file.split('\n').slice(0, largeFileLinesLimit);
		let totalLength = 0;

		for (const line of lines) {
			if (totalLength + line.length <= largeFileSize) {
				totalLength += line.length;
				result.push(line);
			} else {
				result.push(line.substring(0, largeFileSize - totalLength));

				break;
			}
		}

		result.push('\n\n... Output truncated ...');

		return result.join('\n');
	};

	return (
		<Box>
			{sortInputFileNames(Object.keys(inputFiles), detection, requiredFiles).map(name => {
				const value = inputFiles[name];
				const isLargeFile = value.length > largeFileSize;
				const content = !isLargeFile ? value : truncateFile(value);
				const fileDetection = detection?.files[name];
				const simulator = fileDetection?.simulator ?? null;
				const shownIssues = fileDetection?.issues ?? [];

				return (
					<Box key={name}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								flexWrap: 'wrap',
								gap: 1,
								marginBlockStart: '0.83em',
								marginBlockEnd: shownIssues.length > 0 ? 0 : '0.83em'
							}}>
							<Typography
								sx={{
									fontWeight: 'bold',
									fontSize: '1.5em'
								}}>
								{name}
							</Typography>
							{fileDetection && (
								<Chip
									size='small'
									variant='outlined'
									color={simulator ? 'primary' : 'default'}
									label={simulator ? simulatorName(simulator) : 'Additional file'}
								/>
							)}
							<Button
								color='info'
								disabled={value.trim() === ''}
								onClick={() => saveInputFile(name, value)}>
								Download
							</Button>
							<Button
								color='warning'
								disabled={value.trim() === ''}
								onClick={() => onClear(name)}>
								Clear
							</Button>
							{onRemove && (
								<Button
									color='error'
									onClick={() => onRemove(name)}>
									Delete
								</Button>
							)}
							{selectedFiles && onToggleSelected && (
								<FormControlLabel
									sx={{ marginLeft: 'auto' }}
									control={
										<Checkbox
											checked={selectedFiles.includes(name)}
											onChange={() => onToggleSelected(name)}
										/>
									}
									label='Include in run'
								/>
							)}
							{isLargeFile && (
								<Box
									sx={{
										color: 'error.main',
										display: 'inline-flex'
									}}>
									File is to large, displaying first few lines...
								</Box>
							)}
						</Box>
						{shownIssues.map(issue => (
							<Box
								key={issue.code}
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: 1,
									marginBlockEnd: '0.5em'
								}}>
								<Typography
									variant='body2'
									color='warning'>
									{issue.message}
								</Typography>
								{onRename && (
									<Button
										size='small'
										onClick={() => onRename(name, issue.suggestedName)}>
										Rename to {issue.suggestedName}
									</Button>
								)}
							</Box>
						))}
						<CodeEditor
							aria-label={name + ' text field'}
							value={content}
							placeholder={`Please enter ${name} content.`}
							onChange={evn => {
								if (!isLargeFile) onChange(name, evn.target.value);
							}}
							disabled={isLargeFile}
							data-color-mode={theme.palette.mode}
							padding={15}
							style={{
								fontSize: 12,
								backgroundColor:
									theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
								fontFamily:
									'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
								maxHeight: name === 'sobp.dat' ? '15rem' : 'unset',
								overflowY: name === 'sobp.dat' ? 'auto' : 'unset',
								borderRadius: theme.spacing(1)
							}}
						/>
					</Box>
				);
			})}
		</Box>
	);
}
