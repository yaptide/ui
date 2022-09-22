import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	List,
	ListItem,
	ListItemButton,
	Tab,
	Tabs,
	TextField
} from '@mui/material';
import EXAMPLES from '../../examples/examples';
import { heIL } from '@mui/x-data-grid';
import React, { useState } from 'react';
import { DragDropFile } from '../../../util/DragDropFile';
import { CustomDialogTitle } from './CustomDialog';

export type OpenFileProps = {
	open: boolean;
	onClose: () => void;
	onFileSelected: (files: FileList) => void;
	onPlainTextSubmitted: (text: string) => void;
	onUrlSubmitted: (url: string) => void;
};

function a11yProps(index: number) {
	return {
		'id': `simple-tab-${index}`,
		'aria-controls': `simple-tabpanel-${index}`
	};
}

export function OpenFileDialog(props: OpenFileProps) {
	const { open, onClose, onFileSelected, onPlainTextSubmitted, onUrlSubmitted } = props;
	const [FileList, setFileList] = useState<FileList | null>(null);
	const [value, setValue] = React.useState('1');
	const handleChange = (event: React.SyntheticEvent, newValue: string) => {
		setValue(newValue);
	};

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
							<Tab label='Examples' value='0' />
							<Tab label='Send' value='1' />
							<Tab label='From URL' value='2' />
							<Tab label='Plain text' value='3' />
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
							<List>
								{EXAMPLES.map((example, idx) => (
									<ListItem
										disablePadding
										key={
											example?.editor.project?.title ??
											'Example_' + idx.toString()
										}
										value={idx}
										onClick={() => setExampleIndex(idx)}
										selected={exampleIndex === idx}>
										<ListItemButton>
											{example?.editor.project?.title ??
												'Example_' + idx.toString()}
										</ListItemButton>
									</ListItem>
								))}
							</List>
							<Button
								variant='contained'
								fullWidth
								sx={{ marginTop: 'auto' }}
								disabled={exampleIndex === null}
								onClick={() => {
									onClose();
									onPlainTextSubmitted(
										JSON.stringify(EXAMPLES[exampleIndex ?? 0].editor)
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
							<DragDropFile
								id={'input-file-upload'}
								onSubmit={files => {
									setFileList(files);
								}}
							/>
							<Button
								variant='contained'
								fullWidth
								sx={{ marginTop: 'auto' }}
								disabled={FileList === null}
								onClick={() => {
									onClose();
									if (FileList) onFileSelected(FileList);
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
									onUrlSubmitted(url);
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
									onPlainTextSubmitted(plainText);
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
