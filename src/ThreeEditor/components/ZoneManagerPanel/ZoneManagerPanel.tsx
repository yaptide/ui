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
	Theme,
	Tooltip
} from '@mui/material';
import {
	FC,
	Fragment,
	MouseEvent,
	ReactNode,
	SyntheticEvent,
	useCallback,
	useEffect,
	useRef,
	useState
} from 'react';
import * as THREE from 'three';

import ScrollPositionManager from '../../../libs/ScrollPositionManager';
import { isOperation, OperationDataList } from '../../../types/Operation';
import { YaptideEditor } from '../../js/YaptideEditor';
import { BooleanZone } from '../../Simulation/Zones/BooleanZone';
import { BooleanAlgebraData } from './BooleanAlgebra/BooleanAlgebraData';
import BooleanAlgebraRow, { BooleanAlgebraRowProps } from './BooleanAlgebra/BooleanAlgebraRow';
import { GeometryIdSelect } from './GeometryIdSelect';

type BooleanZoneManagerPanelProps = {
	editor: YaptideEditor;
	zone: BooleanZone;
	handleChanged: (index: number, data: BooleanAlgebraData) => void;
	handleAdd: () => void;
	handleRemove: (index: number) => void;
};

function ZoneManagerPanel(props: BooleanZoneManagerPanelProps) {
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
	const backdropHandleClick = useCallback((event: MouseEvent<HTMLElement>) => {
		// get the element that was clicked
		const target = event.target as HTMLElement;

		// if the element that was clicked is not the backdrop element return
		if (target !== backdropRef.current) return;
		// otherwise close the backdrop
		setBackdropOpen(false);
	}, []);
	const selectedGeometryIdRef = useRef<number>(0);
	const changeSelectedGeometryId = useCallback(
		(index: number) => (_: MouseEvent<HTMLElement>) => {
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
			(_: MouseEvent<HTMLElement>, value?: string | null) => {
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

	/*------------------------------------BooleanZone-------------------------------------*/
	const zoneRef = useRef<BooleanZone>();

	useEffect(() => {
		zoneRef.current = zone;
		loadAlgebraDataFromZone();
	}, [zone, loadAlgebraDataFromZone]);

	/*---------------------------------AllGeometries---------------------------------*/
	const allObjectsRef = useRef<THREE.Object3D[]>([]);

	const refreshObjectsList = useCallback(() => {
		allObjectsRef.current = [...editor.figureManager.figures];
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
		rowComponent?: FC<Pick<BooleanAlgebraRowProps, 'scrollWrapperRef'>>;
		children?: ReactNode;
		index: number;
		value: typeof algebraRow;
	}

	function AlgebraDataPanel({
		children = <Fragment />,
		rowComponent = () => <Fragment />,
		value,
		index,
		...restProps
	}: AlgebraDataPanelProps) {
		const wrapperRef = useRef<HTMLDivElement | null>(null);

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
				<ScrollPositionManager scrollKey={`vertical-tabpanel-${index}`}>
					{({
						connectScrollTarget
					}: {
						connectScrollTarget: (node: unknown) => void;
					}) => {
						return (
							<Box
								ref={(node: HTMLDivElement) => {
									connectScrollTarget(node);
									wrapperRef.current = node;
								}}
								sx={{
									overflow: 'auto',
									position: 'relative',
									height: '100%',
									display: 'flex',
									flexDirection: 'column'
								}}>
								{value.index === index && (
									<>
										{children}
										{rowComponent({ scrollWrapperRef: wrapperRef })}
									</>
								)}
							</Box>
						);
					}}
				</ScrollPositionManager>
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

	/**
	 * @description Wrapper for the custom content in the tabs bar
	 */
	function ActionTab({ children }: { children: ReactNode }) {
		return <>{children}</>;
	}

	function handleTabsChange(event: SyntheticEvent, newValue: number) {
		setAlgebraRow({
			index: newValue,
			data: algebraDataRef.current[newValue]
		});
	}

	return (
		<Box
			sx={{
				bgcolor: theme => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
				display: 'grid',
				maxHeight: PANEL_HEIGHT,
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
				<ActionTab>
					<Tooltip
						title='Add row'
						placement='right'>
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
				</ActionTab>
			</Tabs>
			<AlgebraDataPanel
				value={algebraRow}
				index={-1}></AlgebraDataPanel>
			{algebraDataRef.current.map((row, id) => {
				return (
					<AlgebraDataPanel
						value={algebraRow}
						key={id}
						index={id}
						rowComponent={({ scrollWrapperRef }) => (
							<BooleanAlgebraRow
								scrollWrapperRef={scrollWrapperRef}
								onGeometryClick={changeSelectedGeometryId}
								onOperationChange={updateCurrentOperation(id)}
								allObjects={allObjectsRef.current}
								value={row.value}
							/>
						)}>
						<Box
							sx={{
								position: 'sticky',
								top: 0,
								marginLeft: 'auto',
								zIndex: 1
							}}>
							<Tooltip
								title='Delete row'
								placement='left'>
								<IconButton
									aria-label='delete'
									onClick={removeAlgebraDataRow(id)}
									color='error'
									sx={{
										'ml': 'auto',
										'width': '24px',
										'height': '24px',
										'borderRadius': 0,
										'color': ({ palette }: Theme) =>
											palette.mode === 'dark'
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
					</AlgebraDataPanel>
				);
			})}
			<Backdrop
				ref={backdropRef}
				sx={{
					color: '#fff',
					zIndex: ({ zIndex }: Theme) => zIndex.drawer + 1,
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
