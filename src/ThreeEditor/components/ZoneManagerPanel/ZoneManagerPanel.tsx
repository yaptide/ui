import { Box, Button, IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Editor } from '../../js/Editor';
import * as CSG from '../../util/CSG/CSG';
import BooleanAlgebraRow, { AlgebraRow } from './BooleanAlgebraRow';
import './zoneManagerPanel.css';
import ClearIcon from '@mui/icons-material/Clear';

type ZoneManagerPanelProps = {
	editor: Editor;
	zone?: CSG.Zone;
};

function ZoneManagerPanel(props: ZoneManagerPanelProps) {
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

	const changeRowValues = (rowId: number) => (row: AlgebraRow) => {
		setRows(prev => {
			const newRows = [
				...prev.map((el, id) => {
					return rowId === id ? row : el;
				})
			];

			if (rowId < (zoneRef.current?.unionOperations.length ?? 0))
				zoneRef.current?.updateUnion(rowId, parseAlgebraRow(row));

			return newRows;
		});
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
	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setCurrentRow(newValue);
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
				<Box
					sx={{
						overflow: 'auto',
						position: 'relative',
						height: '100%',
						display: 'flex',
						flexDirection: 'column'
					}}>
					<Box
						sx={{
							position: 'sticky',
							top: 0,
							marginLeft: 'auto'
						}}>
						<Tooltip title='Delete row' placement='left'>
							<IconButton
								aria-label='delete'
								onClick={removeRow(index)}
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
					{value === index && children}
				</Box>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				flexGrow: 1,
				bgcolor: 'background.paper',
				display: 'grid',
				height: 224,
				gridTemplateRows: '100%',
				gridTemplateColumns: '40px 1fr'
			}}>
			<Tabs
				orientation='vertical'
				variant='scrollable'
				value={currentRow}
				onChange={handleChange}
				aria-label='Vertical tabs example'
				sx={{ borderRight: 1, borderColor: 'divider', minWidth: 30 }}>
				{rows.map((row, id) => {
					return <Tab {...a11yProps(id)} />;
				})}
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
			</Tabs>
			<TabPanel value={currentRow} index={-1}></TabPanel>
			{rows.map((row, id) => {
				return (
					<TabPanel value={currentRow} key={id} index={id}>
						<BooleanAlgebraRow
							id={id}
							change={changeRowValues(id)}
							value={row}
							possibleObjects={allObjects}></BooleanAlgebraRow>
					</TabPanel>
				);
			})}
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
