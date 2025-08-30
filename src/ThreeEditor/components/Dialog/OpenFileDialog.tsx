import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { TabContext, TabPanel } from '@mui/lab';
import { Box, Button, IconButton, TextField, Tooltip } from '@mui/material';
import { ChangeEvent, SyntheticEvent, useCallback, useMemo, useState } from 'react';

import { LoaderContext } from '../../../services/LoaderService';
import { StyledTab, StyledTabs } from '../../../shared/components/Tabs/StyledTabs';
import { ConcreteDialogProps, CustomDialog } from './CustomDialog';
import { DragDropProject } from './DragDropProject';

export function OpenFileDialog({
	onClose,
	loadFromFiles,
	loadFromUrl,
	loadFromJsonString,
	dialogState
}: ConcreteDialogProps<LoaderContext> & {
	dialogState: string;
}) {
	const [currentFileList, setCurrentFileList] = useState<FileList>();
	const [value, setValue] = useState(dialogState);
	const handleChange = (event: SyntheticEvent, newValue: string) => {
		setValue(newValue);
	};

	const [plainText, setPlainText] = useState('');
	const handlePlainTextChange = (event: ChangeEvent<HTMLInputElement>) => {
		setPlainText(event.target.value);
	};

	const [url, setUrl] = useState('');
	const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
		setUrl(event.target.value);
	};
	const tabList = useMemo(() => ['Upload file', 'From URL', 'Plain text'], []);
	const tabPanelProps = useCallback(
		(index: number) => ({
			value: index.toString(),
			hidden: value !== index.toString() ? true : undefined
		}),
		[value]
	);

	return (
		<CustomDialog
			onClose={onClose}
			title='Open Project'
			contentText='Select a project to open'
			sx={{
				'& .MuiDialog-paper': {
					minWidth: '600px',
					minHeight: '500px'
				}
			}}
			body={
				<TabContext value={value}>
					<Box sx={{ marginTop: 2 }}>
						<StyledTabs
							centered
							value={value}
							onChange={handleChange}
							aria-label='open project tabs example'>
							{tabList.map((tab, idx) => (
								<StyledTab
									label={tab}
									value={idx.toString()}
									key={tab}
								/>
							))}
						</StyledTabs>
					</Box>
					<TabPanel {...tabPanelProps(0)}>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								gap: 2,
								height: 319,
								boxSizing: 'border-box',
								position: 'relative'
							}}>
							<DragDropProject
								id={'input-file-upload-open'}
								onSubmit={setCurrentFileList}
								currentFiles={currentFileList}
								acceptedFiles={'.json'}
							/>
							<Tooltip title='Clear selection'>
								{/* Tooltip requires a non disabled child to properly handle events */}
								<span>
									<IconButton
										color='error'
										sx={{
											position: 'absolute',
											right: 20,
											top: 5,
											opacity: currentFileList === undefined ? 0 : 1
										}}
										edge='end'
										disabled={currentFileList === undefined}
										onClick={() => {
											setCurrentFileList(undefined);
										}}>
										<RemoveCircleOutlineIcon />
									</IconButton>
								</span>
							</Tooltip>
							<Button
								variant='contained'
								fullWidth
								color='secondary'
								sx={{ marginTop: 'auto' }}
								disabled={currentFileList === undefined}
								onClick={() => {
									onClose();
									loadFromFiles(currentFileList);
									setCurrentFileList(undefined);
								}}>
								Load
							</Button>
						</Box>
					</TabPanel>
					<TabPanel {...tabPanelProps(1)}>
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
								color='secondary'
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
					<TabPanel {...tabPanelProps(2)}>
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
								color='secondary'
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
			}></CustomDialog>
	);
}
