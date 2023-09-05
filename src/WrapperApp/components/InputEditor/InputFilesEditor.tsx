import { Box, Button, Card, CardActions, CardContent, Divider } from '@mui/material';
import useTheme from '@mui/system/useTheme';
import CodeEditor from '@uiw/react-textarea-code-editor';

import { useConfig } from '../../../config/ConfigService';
import { useAuth } from '../../../services/AuthService';
import { useDialog } from '../../../services/DialogService';
import { useStore } from '../../../services/StoreService';
import { SimulatorType } from '../../../types/RequestTypes';
import {
	_defaultFlukaInputFiles,
	_defaultShInputFiles,
	_defaultTopasInputFiles,
	_orderedShInputFilesNames,
	isKnownInputFile,
	SimulationInputFiles
} from '../../../types/ResponseTypes';
import { saveString } from '../../../util/File';

interface InputFilesEditorProps {
	simulator: SimulatorType;
	inputFiles: SimulationInputFiles | undefined;
	onChange?: (inputFiles: SimulationInputFiles) => void;
	saveAndExit?: (inputFiles: SimulationInputFiles) => void;
	closeEditor?: () => void;
}

export function InputFilesEditor(props: InputFilesEditorProps) {
	const [open] = useDialog('runSimulation');
	const { setTrackedId } = useStore();
	const { demoMode } = useConfig();
	const { isAuthorized } = useAuth();
	const inputFiles = props.inputFiles ?? _defaultShInputFiles;
	const theme = useTheme();
	const largeFileSize = 100_000;
	const largeFileLinesLimit = 500;

	const canBeDeleted = (name: string) => {
		switch (props.simulator) {
			case SimulatorType.SHIELDHIT:
				return !(name in _defaultShInputFiles);
			case SimulatorType.TOPAS:
				return !(name in _defaultTopasInputFiles);
			case SimulatorType.FLUKA:
				return !(name in _defaultFlukaInputFiles);
			default:
				return false;
		}
	};

	const updateInputFiles = (updateFn: (old: SimulationInputFiles) => SimulationInputFiles) => {
		props.onChange?.call(null, updateFn(inputFiles));
	};

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
		<Card sx={{ minHeight: '100%' }}>
			<CardActions
				sx={{
					justifyContent: 'flex-end',
					background: theme => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300')
				}}>
				<Button
					color='success'
					variant='contained'
					disabled={demoMode || !isAuthorized}
					onClick={() =>
						open({
							inputFiles: Object.fromEntries(
								Object.entries(inputFiles).filter(([, data]) => data.length > 0)
							),
							simulator: props.simulator,
							onSubmit: setTrackedId
						})
					}>
					Run with these input files
				</Button>
				<Button
					color='info'
					onClick={() =>
						Object.entries(inputFiles).map(([name, value]) => saveString(value, name))
					}>
					Download all
				</Button>
				{props.saveAndExit && (
					<Button
						disabled={demoMode}
						color='info'
						onClick={() => props.saveAndExit?.call(null, inputFiles)}>
						Save and exit
					</Button>
				)}
				{props.closeEditor && (
					<Button
						color='info'
						onClick={() => props.closeEditor?.call(null)}>
						Close
					</Button>
				)}
			</CardActions>
			<Divider />
			<CardContent>
				{Object.entries(inputFiles)
					.sort(([name1, _1], [name2, _2]) => {
						const index1 = isKnownInputFile(name1)
							? _orderedShInputFilesNames.indexOf(name1)
							: _orderedShInputFilesNames.length;

						const index2 = isKnownInputFile(name2)
							? _orderedShInputFilesNames.indexOf(name2)
							: _orderedShInputFilesNames.length;

						return index1 - index2;
					})
					.map(([name, value]) => {
						const isLargeFile = value.length > largeFileSize;
						const content = !isLargeFile ? value : truncateFile(value);

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
									<Button
										color='warning'
										disabled={value.trim() === ''}
										onClick={() => {
											updateInputFiles(old => {
												return { ...old, [name]: '' };
											});
										}}
										sx={{ ml: 1 }}>
										Clear
									</Button>

									{canBeDeleted(name) && (
										<Button
											color='error'
											disabled={name in _defaultShInputFiles}
											onClick={() => {
												updateInputFiles(old => {
													if (name in old)
														delete old[
															name as keyof SimulationInputFiles
														];

													return { ...old };
												});
											}}
											sx={{ ml: 1 }}>
											Delete
										</Button>
									)}
									{isLargeFile && (
										<Box
											color='error.main'
											sx={{
												ml: 1,
												display: 'inline-flex',
												fontSize: 'initial'
											}}>
											File is to large, displaying first few lines...
										</Box>
									)}
								</h2>
								<CodeEditor
									aria-label={name + ' text field'}
									value={content}
									placeholder={`Please enter ${name} content.`}
									onChange={evn => {
										if (!isLargeFile) {
											updateInputFiles(old => {
												return { ...old, [name]: evn.target.value };
											});
										}
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
