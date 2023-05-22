import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	Divider,
	List,
	ListItem,
	ListItemButton,
	Tab,
	TextField
} from '@mui/material';
import React, { useState } from 'react';
import { useLoader } from '../../../services/DataLoaderService';
import EXAMPLES from '../../examples/examples';
import { CustomDialogTitle } from './CustomDialog';
import { JobStatusData, StatusState } from '../../../types/ResponseTypes';
import { DragDropProject } from './DragDropProject';

export type OpenFileProps = {
	open: boolean;
	onClose: () => void;
	onFileSelected: (files: FileList) => void;
	onUrlSubmitted: (url: string) => void;
};

export function OpenFileDialog(props: OpenFileProps) {
	const { open, onClose } = props;
	const [currentFileList, setCurrentFileList] = useState<FileList>();
	const [value, setValue] = React.useState('1');
	const handleChange = (event: React.SyntheticEvent, newValue: string) => {
		setValue(newValue);
	};

	const { loadFromJson, loadFromFiles, loadFromUrl, loadFromJsonString } = useLoader();
	const [plainText, setPlainText] = React.useState('');
	const handlePlainTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPlainText(event.target.value);
	};

	const [url, setUrl] = React.useState('');
	const [exampleIndex, setExampleIndex] = useState<number | null>(null);
	const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setUrl(event.target.value);
	};

	return (
		<Dialog
			aria-label={'Open project dialog'}
			open={open}
			onClose={onClose}
			sx={{
				'& .MuiDialog-paper': {
					minWidth: '600px',
					minHeight: '500px'
				}
			}}>
			<CustomDialogTitle onClose={onClose}>Open project</CustomDialogTitle>
			<DialogContent>
				<TabContext value={value}>
					<Box>
						<TabList
							centered
							onChange={handleChange}
							aria-label='open project tabs example'>
							<Tab
								label='Examples'
								value='0'
							/>
							<Tab
								label='Send'
								value='1'
							/>
							<Tab
								label='From URL'
								value='2'
							/>
							<Tab
								label='Plain text'
								value='3'
							/>
						</TabList>
					</Box>
					<Divider />
					<TabPanel value='0'>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								gap: 2,
								height: 319,
								boxSizing: 'border-box'
							}}>
							<List id={'Examples list'}>
								{EXAMPLES.map((example, idx) => (
									<ListItem
										disablePadding
										key={
											example?.inputJson?.project?.title ??
											'Example_' + idx.toString()
										}
										value={idx}
										aria-labelledby={`example-btn-${idx}`}
										aria-selected={exampleIndex === idx}
										onClick={() => setExampleIndex(idx)}>
										<ListItemButton
											id={`example-btn-${idx}`}
											selected={exampleIndex === idx}>
											{example?.inputJson?.project?.title ??
												'Example_' + idx.toString()}
										</ListItemButton>
									</ListItem>
								))}
							</List>
							<Button
								aria-label='Load example button'
								variant='contained'
								fullWidth
								sx={{ marginTop: 'auto' }}
								disabled={exampleIndex === null}
								onClick={() => {
									onClose();
									loadFromJson(
										[EXAMPLES[exampleIndex ?? 0]].map(e => {
											return {
												...e,
												jobState: StatusState.COMPLETED
											} as JobStatusData<StatusState.COMPLETED>;
										})
									);
								}}>
								Load
							</Button>
						</Box>
					</TabPanel>
					<TabPanel value='1'>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								gap: 2,
								height: 319,
								boxSizing: 'border-box'
							}}>
							<DragDropProject
								id={'input-file-upload-open'}
								onSubmit={setCurrentFileList}
								currentFiles={currentFileList}
								acceptedFiles={'.json'}
							/>

							<Button
								variant='contained'
								fullWidth
								sx={{ marginTop: 'auto' }}
								disabled={currentFileList === undefined}
								onClick={() => {
									onClose();
									loadFromFiles(currentFileList);
								}}>
								Load
							</Button>
						</Box>
					</TabPanel>
					<TabPanel value='2'>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								gap: 2,
								height: 319,
								boxSizing: 'border-box'
							}}>
							<TextField
								fullWidth
								id='outlined-static'
								placeholder='Paste project URL here'
								variant='outlined'
								value={url}
								onChange={handleUrlChange}
							/>
							<Button
								variant='contained'
								fullWidth
								sx={{ marginTop: 'auto' }}
								disabled={url === ''}
								onClick={() => {
									onClose();
									loadFromUrl(url);
								}}>
								Load
							</Button>
						</Box>
					</TabPanel>
					<TabPanel value='3'>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								gap: 2,
								height: 319,
								boxSizing: 'border-box'
							}}>
							<TextField
								fullWidth
								id='outlined-multiline-static'
								multiline
								rows={10}
								placeholder='Paste project JSON here'
								variant='outlined'
								value={plainText}
								onChange={handlePlainTextChange}
							/>
							<Button
								variant='contained'
								fullWidth
								sx={{ marginTop: 'auto' }}
								disabled={plainText === ''}
								onClick={() => {
									onClose();
									loadFromJsonString(plainText);
								}}>
								Load
							</Button>
						</Box>
					</TabPanel>
				</TabContext>
			</DialogContent>
		</Dialog>
	);
}
