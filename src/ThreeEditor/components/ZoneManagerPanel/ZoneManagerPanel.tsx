import ClearIcon from '@mui/icons-material/Clear';
import {
	Backdrop,
	Box,
	Button,
	Card,
	IconButton,
	MenuItem,
	Select,
	SelectChangeEvent,
	Tab,
	Tabs,
	Tooltip
} from '@mui/material';
import React, { LegacyRef, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import ScrollManager from '../../../libs/ScrollManager';
import { Editor } from '../../js/Editor';
import * as CSG from '../../util/CSG/CSG';
import { Operation } from '../../util/Operation';
import BooleanAlgebraRow, { AlgebraRow } from './BooleanAlgebraRow';
import './zoneManagerPanel.css';

type ZoneManagerPanelProps = {
	editor: Editor;
	zone?: CSG.Zone;
};

function ZoneManagerPanel(props: ZoneManagerPanelProps) {
	const PANEL_HEIGHT = 300;
	const [rows, setRows] = useState<AlgebraRow[]>([{ geometriesId: [], operations: [] }]);

	const [allObjects, setAllObjects] = useState<THREE.Object3D[]>([]);

	const zoneRef = useRef<CSG.Zone>();

	const parseAlgebraRow = (row: AlgebraRow) => {
		const operations: CSG.OperationTuple[] = [];

		if (row.geometriesId[0]) {
			const object = props.editor.scene.getObjectById(row.geometriesId[0]) as THREE.Mesh;

			if (!object)
				throw new Error(
					'object is undefined form props.editor.scene.getObjectById(row.geometries[0])'
				);

			operations.push(new CSG.OperationTuple(object, 'union'));
		}

		for (let i = 0; i < row.operations.length; i++) {
			const operation = row.operations[i];
			const geometryID = row.geometriesId[i + 1];
			if (row.geometriesId.length > i + 1 && Number.isInteger(geometryID) && operation) {
				const object = props.editor.scene.getObjectById(geometryID as number) as THREE.Mesh;

				if (!object)
					throw new Error(
						'object is undefined form props.editor.scene.getObjectById(geometryID)'
					);

				operations.push(new CSG.OperationTuple(object, operation));
			}
		}

		return operations;
	};

	const addAlgebraRow = () => {
		setRows(prev => {
			const newRows = [...prev, { geometriesId: [], operations: [] }];
			setCurrentRow(newRows.length - 1);
			zoneRef.current?.addUnion();
			return newRows;
		});
	};

	const removeRow = (removeId: number) => () => {
		setRows(prev => {
			let newRows = [...prev.filter((el, id) => id !== removeId)];
			if (newRows.length === 0) newRows = [{ geometriesId: [], operations: [] }];
			else {
				setCurrentRow(prev => (prev >= removeId && prev !== 0 ? prev - 1 : prev));
				zoneRef.current?.removeUnion(removeId);
			}
			return newRows;
		});
	};

	const refreshObjectsList = useCallback(() => {
		setAllObjects([...props.editor.scene.children]);
	}, [props.editor]);

	const loadRows = useCallback(() => {
		const newRows: AlgebraRow[] = [];
		zoneRef.current?.unionOperations.forEach(union => {
			const row: AlgebraRow = { geometriesId: [], operations: [] };

			union.forEach(operation => {
				row.geometriesId.push(operation.object.id);
				if (operation.mode !== 'union') row.operations.push(operation.mode);
			});

			newRows.push(row);
		});
		if (newRows.length === 0) newRows.push({ geometriesId: [], operations: [] });

		setRows([...newRows]);
	}, []);

	const initZone = useCallback(() => {
		const manager = props.editor.zoneManager;
		props.zone
			? (() => {
					zoneRef.current = props.zone;
					loadRows();
			  })()
			: (zoneRef.current = manager.createZone());
	}, [loadRows, props.editor.zoneManager, props.zone]);

	useEffect(() => {
		initZone();
	}, [initZone]);

	useEffect(() => {
		props.editor.signals.zoneChanged.add(loadRows);
		return () => {
			props.editor.signals.zoneChanged.remove(loadRows);
		};
	}, [loadRows, props.editor.signals.zoneChanged]);

	useEffect(() => {
		refreshObjectsList();
		props.editor.signals.objectAdded.add(refreshObjectsList);
		props.editor.signals.objectRemoved.add(refreshObjectsList);
		return () => {
			props.editor.signals.objectAdded.remove(refreshObjectsList);
			props.editor.signals.objectRemoved.remove(refreshObjectsList);
		};
	}, [props.editor, refreshObjectsList]);

	const [currentRow, setCurrentRow] = useState<number>(0);
	const [currentRowElement, setCurrentRowElement] = useState<number>(0);
	const [openSelect, setOpenSelect] = useState<boolean>(false);
	const handleTabsChange = (event: React.SyntheticEvent, newValue: number) => {
		setCurrentRow(newValue);
	};

	const setGeometry = useCallback(
		(index: number) => (value: number | null) => (prev: AlgebraRow) => {
			if (value === null)
				// remove geometries after index
				prev.geometriesId.splice(index, prev.geometriesId.length - index);
			else prev.geometriesId.splice(index, 1, value);

			return prev;
		},
		[]
	);

	const setOperation = useCallback(
		(index: number) => (value: Operation | null) => (prev: AlgebraRow) => {
			console.log(prev, 'prev value');
			const newRow: AlgebraRow = {
				geometriesId: [...prev.geometriesId],
				operations: [...prev.operations]
			};
			if (value === null) {
				// remove operations after index
				newRow.operations.splice(index, prev.operations.length - index);
				newRow.geometriesId.splice(index + 1, prev.geometriesId.length - index - 1);
			} else newRow.operations.splice(index, 1, value);
			console.log(newRow, 'new value');
			return prev;
		},
		[]
	);

	const handleSelectChange = (event: SelectChangeEvent<number>, child: ReactNode) => {
		setRows(prev => {
			if (typeof event.target.value !== 'number') return prev;
			const value: number = event.target.value;
			const newRows = [...prev];
			console.log(prev, 'geometries before change');
			newRows.splice(currentRow, 1, setGeometry(currentRowElement)(value)(prev[currentRow]));
			console.log(newRows, 'geometries changed');
			if (currentRow < (zoneRef.current?.unionOperations.length ?? 0))
				zoneRef.current?.updateUnion(currentRow, parseAlgebraRow(newRows[currentRow]));
			return newRows;
		});
	};

	const handleSwitchOperation = (value: Operation | null) => {
		setRows(prev => {
			const newRows = [...prev];
			newRows.splice(currentRow, 1, setOperation(currentRowElement)(value)(prev[currentRow]));
			return newRows;
		});
	};

	function a11yProps(index: number) {
		return {
			'id': `vertical-tab-${index}`,
			'aria-controls': `vertical-tabpanel-${index}`,
			'key': index,
			'label': `#${index + 1}`,
			'sx': { minWidth: 30, borderRadius: 0 }
		};
	}
	interface TabPanelProps {
		children?: React.ReactNode;
		index: number;
		value: number;
	}
	function TabPanel(props: TabPanelProps) {
		const { children, value, index, ...other } = props;

		return (
			<Box
				role='tabpanel'
				hidden={value !== index}
				id={`vertical-tabpanel-${index}`}
				aria-labelledby={`vertical-tab-${index}`}
				sx={{
					height: '100%',
					width: '100%',
					maxHeight: '100%',
					maxWidth: '100%'
				}}
				{...other}>
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
								{value === index && children}
							</div>
						);
					}}
				</ScrollManager>
			</Box>
		);
	}

	function VoidTab({ children }: { children: React.ReactNode }) {
		return <>{children}</>;
	}

	return (
		<Box
			sx={{
				flexGrow: 1,
				bgcolor: 'background.paper',
				display: 'grid',
				height: PANEL_HEIGHT,
				gridTemplateRows: '100%',
				gridTemplateColumns: '40px 1fr'
			}}>
			<Tabs
				orientation='vertical'
				variant='scrollable'
				value={currentRow}
				onChange={handleTabsChange}
				aria-label='Vertical tabs example'
				sx={{ borderRight: 1, borderColor: 'divider', minWidth: 30 }}>
				{rows.map((row, id) => {
					return <Tab {...a11yProps(id)} />;
				})}
				<VoidTab>
					<Tooltip title='Add row' placement='right'>
						<Button
							color='secondary'
							sx={{
								minWidth: 30,
								borderRadius: 0,
								color: 'text.secondary'
							}}
							onClick={addAlgebraRow}>{` + `}</Button>
					</Tooltip>
				</VoidTab>
			</Tabs>
			<TabPanel value={currentRow} index={-1}></TabPanel>
			{rows.map((row, id) => {
				return (
					<TabPanel value={currentRow} key={id} index={id}>
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
									onClick={removeRow(id)}
									color='error'
									sx={{
										'ml': 'auto',
										'width': '24px',
										'height': '24px',
										'borderRadius': 0,
										'color': 'secondary.main',
										'&:hover': {
											color: 'error.main'
										}
									}}>
									<ClearIcon />
								</IconButton>
							</Tooltip>
						</Box>
						<BooleanAlgebraRow
							id={id}
							onGeometrySelect={(index: number) => {
								setCurrentRowElement(index);
								setOpenSelect(true);
							}}
							value={row}
							possibleObjects={allObjects}
							handleSwitchOperation={handleSwitchOperation}></BooleanAlgebraRow>
					</TabPanel>
				);
			})}
			<Backdrop
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
				onClick={() => {
					setOpenSelect(false);
				}}
				open={openSelect}>
				<Card
					sx={{
						padding: '96px 24px',
						position: 'sticky',
						top: '12px',
						display: 'flex',
						alignItems: 'start',
						justifyContent: 'center'
					}}>
					<Select
						labelId={'GeometryLabel'}
						id={'GeometryInput'}
						className='geometrySelect'
						displayEmpty
						value={rows[currentRow].geometriesId[currentRowElement] ?? ''}
						onChange={handleSelectChange}>
						<MenuItem disabled value={0}>
							<em>Geometry</em>
						</MenuItem>
						{allObjects.map((geo, index) => {
							return (
								<MenuItem key={geo.id} value={geo.id}>
									{geo.name}:{geo.id}
								</MenuItem>
							);
						})}
					</Select>
				</Card>
			</Backdrop>
		</Box>
	);
	// <div className='zoneManagerWrapper'>
	// 	{rows.map((row, id) => {
	// 		return (
	// 			<BooleanAlgebraRow
	// 				key={id}
	// 				id={id}
	// 				del={removeRow(id)}
	// 				change={changeRowValues(id)}
	// 				value={row}
	// 				possibleObjects={allObjects}></BooleanAlgebraRow>
	// 		);
	// 	})}
	// 	<Button className='addRowButton' onClick={addAlgebraRow}>
	// 		+
	// 	</Button>
	// </div>
}

export default ZoneManagerPanel;
