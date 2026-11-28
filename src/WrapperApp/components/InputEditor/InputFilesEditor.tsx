import { Box, Button, Checkbox, Chip, FormControlLabel, Skeleton, Typography } from '@mui/material';
import { lazy, Suspense } from 'react';

import { saveInputFile } from './saveInputFiles';
import {
	InputFiles,
	RequiredInputFiles,
	SimulatorDetection,
	simulatorName,
	sortInputFileNames
} from './simulatorDetection';

const InputFileCodeEditor = lazy(() =>
	import('./InputFileCodeEditor').then(module => ({ default: module.InputFileCodeEditor }))
);

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
	return (
		<Box>
			{sortInputFileNames(Object.keys(inputFiles), detection, requiredFiles).map(name => {
				const value = inputFiles[name];
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
						<Suspense
							fallback={
								<Skeleton
									variant='rounded'
									height={120}
								/>
							}>
							<InputFileCodeEditor
								name={name}
								value={value}
								onChange={content => onChange(name, content)}
							/>
						</Suspense>
					</Box>
				);
			})}
		</Box>
	);
}
