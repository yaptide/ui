import { Button } from '@mui/material';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { parseZone } from '../../../util/parseZone/parseZone';
import { Editor } from '../../js/Editor';
import * as CSG from '../../util/CSG/CSG';
import { DEBUG_MODE } from '../../../util/Config';
import BooleanAlgebraRow, { AlgebraRow } from './BooleanAlgebraRow';
import './zoneManagerPanel.css';

type ZoneManagerPanelProps = {
	editor: Editor;
	zone?: CSG.Zone;
};

function ZoneManagerPanel(props: ZoneManagerPanelProps) {
	const [rows, setRows] = useState<AlgebraRow[]>([]);

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
		setRows(prev => [...prev, { geometriesId: [], operations: [] }]);
		zoneRef.current?.addUnion();
	};

	const handleParse = useCallback(
		() => parseZone(rows, props!.zone!.simulationMaterial),
		[props.zone]
	);

	const removeRow = (removeId: number) => () => {
		setRows(prev => {
			const newRows = [...prev.filter((el, id) => id !== removeId)];
			return newRows;
		});
		zoneRef.current?.removeUnion(removeId);
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

	return (
		<div className='zoneManagerWrapper'>
			{rows.map((row, id) => {
				return (
					<BooleanAlgebraRow
						key={id}
						id={id}
						del={removeRow(id)}
						change={changeRowValues(id)}
						value={row}
						possibleObjects={allObjects}></BooleanAlgebraRow>
				);
			})}
			<Button className='addRowButton' onClick={addAlgebraRow}>
				+
			</Button>
			{DEBUG_MODE && (
				<Button className='parseZoneButton' onClick={handleParse}>
					Parse Zone
				</Button>
			)}
		</div>
	);
}

export default ZoneManagerPanel;
