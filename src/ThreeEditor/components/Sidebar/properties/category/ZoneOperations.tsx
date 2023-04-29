import { Grid } from '@mui/material';
import { useCallback } from 'react';
import { Object3D } from 'three';
import { Editor } from '../../../../js/Editor';
import {
	AddZoneOperationTupleCommand,
	RemoveZoneOperationTupleCommand,
	SetZoneOperationTupleCommand
} from '../../../../js/commands/Commands';
import { isBasicMesh } from '../../../../util/BasicMeshes';
import * as CSG from '../../../../util/CSG/CSG';
import { isZone } from '../../../../util/CSG/CSGZone';
import { useSmartWatchEditorState } from '../../../../util/hooks/signals';
import { BooleanAlgebraData } from '../../../ZoneManagerPanel/BooleanAlgebra/BooleanAlgebraData';
import ZoneManagerPanel from '../../../ZoneManagerPanel/ZoneManagerPanel';
import { PropertiesCategory } from './PropertiesCategory';

const parseAlgebraData = (editor: Editor, { value }: BooleanAlgebraData) => {
	const operations: CSG.OperationTuple[] = [];

	value.forEach(({ operation, objectId }, index) => {
		let object;
		if (objectId) object = editor.getObjectById(objectId);
		if (object && isBasicMesh(object))
			operations.push(new CSG.OperationTuple(object, operation));
		else return operations;
	});
	return operations;
};

export function ZoneOperations(props: { editor: Editor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(
		editor,
		isZone(object) ? object : null
	);

	const visibleFlag = isZone(watchedObject);

	const handleChanged = useCallback(
		(algebraIndex: number, algebraRow: BooleanAlgebraData) => {
			if (!watchedObject) return;
			editor.execute(
				new SetZoneOperationTupleCommand(
					editor,
					watchedObject?.object,
					parseAlgebraData(editor, algebraRow),
					algebraIndex
				)
			);
		},
		[editor, watchedObject]
	);

	const handleAdd = useCallback(() => {
		if (!watchedObject) return;
		editor.execute(new AddZoneOperationTupleCommand(editor, watchedObject?.object));
	}, [editor, watchedObject]);

	const handleRemove = useCallback(
		(algebraIndex: number) => {
			if (!watchedObject) return;
			editor.execute(
				new RemoveZoneOperationTupleCommand(editor, watchedObject?.object, algebraIndex)
			);
		},
		[editor, watchedObject]
	);

	return (
		<PropertiesCategory category='Zone Operations' visible={visibleFlag}>
			{watchedObject && (
				<Grid item xs={12}>
					<ZoneManagerPanel
						editor={editor}
						zone={watchedObject.object}
						handleChanged={handleChanged}
						handleAdd={handleAdd}
						handleRemove={handleRemove}
					/>
				</Grid>
			)}
		</PropertiesCategory>
	);
}
