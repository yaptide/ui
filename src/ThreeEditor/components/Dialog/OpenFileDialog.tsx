import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
	Box,
	Button,
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	Tab,
	Tabs,
	TextField,
	Tooltip
} from '@mui/material';
import { ChangeEvent, SyntheticEvent, useCallback, useMemo, useState } from 'react';

import EXAMPLES from '../../../examples/examples';
import { LoaderContext } from '../../../services/LoaderService';
import { FullSimulationData } from '../../../services/ShSimulatorService';
import { SimulatorType } from '../../../types/RequestTypes';
import { StatusState } from '../../../types/ResponseTypes';
import { ConcreteDialogProps, CustomDialog } from './CustomDialog';
import { DragDropProject } from './DragDropProject';

export function OpenFileDialog({
	onClose,
	loadFromJson,
	loadFromFiles,
	loadFromUrl,
	loadFromJsonString
}: ConcreteDialogProps<LoaderContext>) {
	const [currentFileList, setCurrentFileList] = useState<FileList>();
	const [value, setValue] = useState('1');
	const handleChange = (event: SyntheticEvent, newValue: string) => {
		setValue(newValue);
	};

	const [plainText, setPlainText] = useState('');
	const handlePlainTextChange = (event: ChangeEvent<HTMLInputElement>) => {
		setPlainText(event.target.value);
	};

	const [url, setUrl] = useState('');
	const [exampleIndex, setExampleIndex] = useState<number | null>(null);
	const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
		setUrl(event.target.value);
	};
	const tabList = useMemo(() => ['Examples', 'Upload file', 'From URL', 'Plain text'], []);
	const tabPanelProps = useCallback(
		(index: number) => ({
			value: index.toString(),
			hidden: value !== index.toString() ? true : undefined
		}),
		[value]
	);
	const [selectedSimulator, setSelectedSimulator] = useState<SimulatorType>(SimulatorType.COMMON);

	function fetchExampleData(exampleName: string) {
		fetch(`${process.env.PUBLIC_URL}/examples/${exampleName}`)
			.then(function (response) {
				if (response.status !== 200) {
					console.log('Looks like there was a problem. Status Code: ' + response.status);

					return;
				}

				response.json().then(function (data) {
					const simulationData: FullSimulationData = data as FullSimulationData;

					loadFromJson(
						[simulationData].map(e => {
							return {
								...e,
								jobState: StatusState.COMPLETED
							};
						})
					);
				});
			})
			.catch(function (err) {
				console.log('Fetch Error :-S', err);
			});
	}

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
					<Box>
						<TabList
							centered
							onChange={handleChange}
							aria-label='open project tabs example'>
							{tabList.map((tab, idx) => (
								<Tab
									label={tab}
									value={idx.toString()}
									key={tab}
								/>
							))}
						</TabList>
					</Box>
					<Divider />
					<TabPanel {...tabPanelProps(0)}>
						<Tabs
							value={selectedSimulator}
							onChange={(e, newValue) => setSelectedSimulator(newValue)}
							aria-label='simulator selection tabs'
							variant='fullWidth'>
							{Object.values(SimulatorType).map(simulator => (
								<Tab
									label={simulator}
									value={simulator}
								/>
							))}
						</Tabs>
						<Divider />
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								gap: 2,
								height: 319,
								boxSizing: 'border-box'
							}}>
							<List id={'Examples list'}>
								{Object.entries(EXAMPLES[selectedSimulator]).map((name, idx) => (
									<ListItem
										disablePadding
										key={'Example_' + idx.toString()}
										value={idx}
										aria-labelledby={`example-btn-${idx}`}
										aria-selected={exampleIndex === idx}
										onClick={() => setExampleIndex(idx)}>
										<ListItemButton
											id={`example-btn-${idx}`}
											selected={exampleIndex === idx}>
											{name[0]}
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

									fetchExampleData(
										EXAMPLES[selectedSimulator][
											Object.keys(EXAMPLES[selectedSimulator])[
												exampleIndex ?? 0
											]
										]
									);
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
					<TabPanel {...tabPanelProps(3)}>
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
			}></CustomDialog>
	);
}
