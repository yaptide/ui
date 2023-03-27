import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import {
	Backdrop,
	Box,
	Card,
	IconButton,
	SelectChangeEvent,
	Tab,
	Tabs,
	Tooltip
} from '@mui/material';
import React, { LegacyRef, useCallback, useEffect, useRef, useState } from 'react';
import ScrollManager from '../../../libs/ScrollManager';
import { Editor } from '../../js/Editor';
import * as CSG from '../../util/CSG/CSG';
import { OperationDataList, isOperation } from '../../util/Operation';
import { BooleanAlgebraData } from './BooleanAlgebra/BooleanAlgebraData';
import BooleanAlgebraRow from './BooleanAlgebra/BooleanAlgebraRow';
import { GeometryIdSelect } from './GeometryIdSelect';

type ZoneManagerPanelProps = {
	editor: Editor;
	zone?: CSG.Zone;
	handleChanged: (index: number, data: BooleanAlgebraData) => void;
	handleAdd: () => void;
	handleRemove: (index: number) => void;
};

function ZoneManagerPanel(props: ZoneManagerPanelProps) {
	const { editor, zone, handleChanged, handleAdd, handleRemove } = props;
	const PANEL_HEIGHT = 450;

	/*-------------------------------------State-------------------------------------*/
	const [algebraRow, setAlgebraRow] = useState<{
		index: number;
		data: BooleanAlgebraData;
	}>({ index: 0, data: new BooleanAlgebraData() });

	const refreshAlgebraRow = useCallback(
		(prev: typeof algebraRow) => ({
			index: Math.min(prev.index, algebraDataRef.current.length - 1),
			data: algebraDataRef.current[Math.min(prev.index, algebraDataRef.current.length - 1)]
		}),
		[]
	);

	/*-----------------------------------Backdrop-----------------------------------*/
	const [backdropOpen, setBackdropOpen] = useState(false);
	const backdropRef = useRef<HTMLDivElement>(null);
	const openBackdrop = useCallback(() => setBackdropOpen(true), []);
	const closeBackdrop = useCallback(() => setBackdropOpen(false), []);
	const backdropHandleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
		// get the element that was clicked
		const target = event.target as HTMLElement;
		// if the element that was clicked is not the backdrop element return
		if (target !== backdropRef.current) return;
		// otherwise close the backdrop
		setBackdropOpen(false);
	}, []);
	const selectedGeometryIdRef = useRef<number>(0);
	const changeSelectedGeometryId = useCallback(
		(index: number) => (_: React.MouseEvent<HTMLElement>) => {
			selectedGeometryIdRef.current = index;
			openBackdrop();
		},
		[selectedGeometryIdRef, openBackdrop]
	);

	/*----------------------------------UpdateState----------------------------------*/

	const updateCurrentObjectId = useCallback(
		(rowIndex: number, valueIndex: number) => (event: SelectChangeEvent) => {
			const newId = parseInt(event.target.value);

			if (
				algebraDataRef.current[rowIndex].changeObjectId(
					valueIndex,
					isNaN(newId) ? null : newId
				)
			) {
				setAlgebraRow({
					index: rowIndex,
					data: algebraDataRef.current[rowIndex]
				});
				selectedGeometryIdRef.current = 0;
				closeBackdrop();
				handleChanged(rowIndex, algebraDataRef.current[rowIndex]);
			}
		},
		[closeBackdrop, handleChanged]
	);

	const updateCurrentOperation = useCallback(
		(rowIndex: number) =>
			(valueIndex: number) =>
			(_: React.MouseEvent<HTMLElement>, value?: string | null) => {
				if (value === null) return;
				const newOperation = isOperation(value) ? value : null;
				if (algebraDataRef.current[rowIndex].changeOperation(valueIndex, newOperation)) {
					setAlgebraRow({
						index: rowIndex,
						data: algebraDataRef.current[rowIndex]
					});
					const last = algebraDataRef.current[rowIndex].value.length - 1;
					if (
						valueIndex !== last ||
						algebraDataRef.current[rowIndex].value[last].objectId !== null
					)
						handleChanged(rowIndex, algebraDataRef.current[rowIndex]);
				} else console.warn('not changed');
			},
		[handleChanged]
	);

	/*----------------------------------AlgebraData-----------------------------------*/
	const algebraDataRef = useRef<BooleanAlgebraData[]>([new BooleanAlgebraData()]);

	const loadAlgebraDataFromZone = useCallback(() => {
		const newData: BooleanAlgebraData[] =
			zoneRef.current?.unionOperations.map(union =>
				BooleanAlgebraData.fromValue(
					union.map(operation => operation.toRawData()) as OperationDataList
				)
			) ?? [];

		algebraDataRef.current = newData;
		setAlgebraRow(refreshAlgebraRow);
	}, [refreshAlgebraRow]);

	useEffect(() => {
		editor.signals.zoneChanged.add(loadAlgebraDataFromZone);
		return () => {
			editor.signals.zoneChanged.remove(loadAlgebraDataFromZone);
		};
	}, [loadAlgebraDataFromZone, editor.signals.zoneChanged]);

	const pushAlgebraDataRow = useCallback(() => {
		algebraDataRef.current.push(new BooleanAlgebraData());
		const newIndex = algebraDataRef.current.length - 1;
		setAlgebraRow({
			index: newIndex,
			data: algebraDataRef.current[newIndex]
		});
		handleAdd();
	}, [handleAdd]);

	const removeAlgebraDataRow = useCallback(
		(removeId: number) => () => {
			algebraDataRef.current = algebraDataRef.current.filter((el, id) => id !== removeId);
			if (algebraDataRef.current.length === 0) {
				algebraDataRef.current.push(new BooleanAlgebraData());
				setAlgebraRow({ index: 0, data: algebraDataRef.current[0] });
				handleChanged(0, algebraDataRef.current[0]);
			} else {
				setAlgebraRow(prev => {
					const newIndex =
						removeId <= prev.index ? Math.max(prev.index - 1, 0) : prev.index;
					return {
						index: newIndex,
						data: algebraDataRef.current[newIndex]
					};
				});
				handleRemove(removeId);
			}
		},
		[handleChanged, handleRemove]
	);

	/*------------------------------------CSG.Zone-------------------------------------*/
	const zoneRef = useRef<CSG.Zone>();

	const initZone = useCallback(() => {
		const manager = editor.zoneManager;
		zone
			? (() => {
					zoneRef.current = zone;
			  })()
			: (zoneRef.current = manager.createZone());
		loadAlgebraDataFromZone();
	}, [editor.zoneManager, zone, loadAlgebraDataFromZone]);

	useEffect(() => {
		initZone();
	}, [initZone]);

	/*---------------------------------AllGeometries---------------------------------*/
	const allObjectsRef = useRef<THREE.Object3D[]>([]);

	const refreshObjectsList = useCallback(() => {
		allObjectsRef.current = [...editor.scene.children];
	}, [editor]);

	useEffect(() => {
		refreshObjectsList();
		editor.signals.objectAdded.add(refreshObjectsList);
		editor.signals.objectRemoved.add(refreshObjectsList);
		return () => {
			editor.signals.objectAdded.remove(refreshObjectsList);
			editor.signals.objectRemoved.remove(refreshObjectsList);
		};
	}, [editor, refreshObjectsList]);

	/*-------------------------------AlgebraDataPanel-------------------------------*/
	interface AlgebraDataPanelProps {
		children?: React.ReactNode;
		index: number;
		value: typeof algebraRow;
	}
	function AlgebraDataPanel(props: AlgebraDataPanelProps) {
		const { children, value, index, ...restProps } = props;

		return (
			<Box
				role='tabpanel'
				hidden={value.index !== index}
				id={`vertical-tabpanel-${index}`}
				aria-labelledby={`vertical-tab-${index}`}
				sx={{
					height: '100%',
					width: '100%',
					maxHeight: '100%',
					maxWidth: '100%'
				}}
				{...restProps}>
				<ScrollManager scrollKey={`vertical-tabpanel-${index}`}>
					{({
						connectScrollTarget,
						...props
					}: {
						connectScrollTarget: LegacyRef<HTMLDivElement>;
					}) => {
						return (
							<div
								ref={connectScrollTarget}
								style={{
									overflow: 'auto',
									position: 'relative',
									height: '100%',
									display: 'flex',
									flexDirection: 'column'
								}}>
								{value.index === index && children}
							</div>
						);
					}}
				</ScrollManager>
			</Box>
		);
	}

	/*------------------------------------Render------------------------------------*/
	function a11yProps(index: number) {
		return {
			'id': `vertical-tab-${index}`,
			'aria-controls': `vertical-tabpanel-${index}`,
			'key': index,
			'label': `#${index + 1}`,
			'sx': { minWidth: 30, borderRadius: 0 }
		};
	}
	function VoidTab({ children }: { children: React.ReactNode }) {
		return <>{children}</>;
	}

	function handleTabsChange(event: React.SyntheticEvent, newValue: number) {
		setAlgebraRow({
			index: newValue,
			data: algebraDataRef.current[newValue]
		});
	}

	return (
		<Box
			sx={{
				flexGrow: 1,
				bgcolor: theme => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
				display: 'grid',
				height: PANEL_HEIGHT,
				gridTemplateRows: '100%',
				gridTemplateColumns: '40px 1fr',
				margin: '-8px -16px -16px -16px'
			}}>
			<Tabs
				orientation='vertical'
				variant='scrollable'
				value={algebraRow.index}
				onChange={handleTabsChange}
				aria-label='Vertical tabs example'
				sx={{
					borderRight: 1,
					borderColor: 'divider',
					minWidth: 30,
					backgroundColor: theme =>
						theme.palette.mode === 'dark' ? 'background.paper' : 'secondary.light'
				}}>
				{algebraDataRef.current.map((row, id) => {
					return <Tab {...a11yProps(id)} />;
				})}
				<VoidTab>
					<Tooltip title='Add row' placement='right'>
						<IconButton
							color='secondary'
							aria-label='add new data row'
							sx={{
								minWidth: 30,
								borderRadius: 0,
								color: 'text.secondary'
							}}
							onClick={pushAlgebraDataRow}>
							<AddIcon />
						</IconButton>
					</Tooltip>
				</VoidTab>
			</Tabs>
			<AlgebraDataPanel value={algebraRow} index={-1}></AlgebraDataPanel>
			{algebraDataRef.current.map((row, id) => {
				return (
					<AlgebraDataPanel value={algebraRow} key={id} index={id}>
						<Box
							sx={{
								position: 'sticky',
								top: 0,
								marginLeft: 'auto',
								zIndex: 1
							}}>
							<Tooltip title='Delete row' placement='left'>
								<IconButton
									aria-label='delete'
									onClick={removeAlgebraDataRow(id)}
									color='error'
									sx={{
										'ml': 'auto',
										'width': '24px',
										'height': '24px',
										'borderRadius': 0,
										'color': theme =>
											theme.palette.mode === 'dark'
												? 'text.primary'
												: 'secondary.main',
										'&:hover': {
											color: 'error.main'
										}
									}}>
									<ClearIcon />
								</IconButton>
							</Tooltip>
						</Box>
						<BooleanAlgebraRow
							onGeometryClick={changeSelectedGeometryId}
							onOperationChange={updateCurrentOperation(id)}
							allObjects={allObjectsRef.current}
							value={row.value}></BooleanAlgebraRow>
					</AlgebraDataPanel>
				);
			})}
			<Backdrop
				ref={backdropRef}
				sx={{
					color: '#fff',
					zIndex: theme => theme.zIndex.drawer + 1,
					position: 'absolute',
					left: 0,
					bottom: 0,
					width: '100%',
					height: '100%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center'
				}}
				onClick={backdropHandleClick}
				open={backdropOpen}>
				<Card
					sx={{
						padding: '36px 24px',
						boxSizing: 'border-box',
						width: '60%'
					}}>
					{backdropOpen && (
						<GeometryIdSelect
							value={`${
								algebraRow.data.value[selectedGeometryIdRef.current]?.objectId ?? ''
							}`}
							allObjects={allObjectsRef.current}
							onChange={updateCurrentObjectId(
								algebraRow.index,
								selectedGeometryIdRef.current
							)}
							canSelectEmpty={false}
						/>
					)}
				</Card>
			</Backdrop>
		</Box>
	);
}

export default ZoneManagerPanel;
