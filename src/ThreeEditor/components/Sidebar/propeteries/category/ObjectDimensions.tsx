import { BoxGeometry, Object3D, Vector3 } from 'three';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { Editor } from '../../../../js/Editor';
import {
	BooleanPropertyField,
	LabelPropertyField,
	NumberPropertyField,
	SelectPropertyField
} from '../PropertyField';
import { useCallback, useEffect, useState } from 'react';
import {
	useSmartWatchEditorState
} from '../../../../util/hooks/signals';
import { PropertiesCategory } from './PropertiesCategory';
import { Button, Divider, Grid } from '@mui/material';
import {
	BasicMesh,
	BASIC_GEOMETRY_OPTIONS,
	isBasicMesh,
	isBoxMesh
} from '../../../../util/BasicMeshes';
import { DetectGeometry, isDetectGeometry } from '../../../../util/Detect/DetectGeometry';
import { isWorldZone, WorldZone } from '../../../../util/WorldZone/WorldZone';
import { DETECT_OPTIONS } from '../../../../util/Detect/DetectTypes';
import { SetDetectTypeCommand } from '../../../../js/commands/SetDetectTypeCommand';
import { SetDetectGeometryCommand } from '../../../../js/commands/SetDetectGeometryCommand';
import { SetGeometryCommand } from '../../../../js/commands/SetGeometryCommand';

const ObjectTypeField = (props: {
	editor: Editor;
	object: BasicMesh | DetectGeometry | WorldZone;
}) => {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const selectData = useCallback(() => {
		if (isDetectGeometry(watchedObject))
			return { options: DETECT_OPTIONS, value: watchedObject.detectType };
		return { options: BASIC_GEOMETRY_OPTIONS, value: watchedObject.geometryType };
	}, [watchedObject])();

	const onChange = useCallback(
		(value: string) => {
			if (isDetectGeometry(watchedObject))
				return editor.execute(
					new SetDetectTypeCommand(editor, watchedObject.object, value)
				);

			if (isWorldZone(watchedObject))
				return editor.execute(
					new SetValueCommand(editor, watchedObject.object, 'geometryType', value)
				);
		},
		[editor, watchedObject]
	);

	const typeSelectable = isDetectGeometry(watchedObject) || isWorldZone(watchedObject);

	return (
		<>
			{typeSelectable ? (
				<SelectPropertyField
					label='Geometry Type'
					value={selectData.value}
					options={Object.keys(selectData.options)}
					onChange={onChange}
				/>
			) : (
				<LabelPropertyField label='Geometry Type' value={watchedObject.geometryType} />
			)}
		</>
	);
};

const WorldZoneCalculateField = (props: { editor: Editor; object: WorldZone }) => {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const renderFlag = watchedObject.geometryType === 'Box';
	if (!renderFlag) return null;

	return (
		<>
			<Grid item xs={12}>
				<Divider />
			</Grid>
			<BooleanPropertyField
				label='Automatic'
				value={watchedObject.autoCalculate}
				onChange={value => {
					editor.execute(
						new SetValueCommand(
							editor,
							watchedObject.object,
							'autoCalculate',
							value,
							true
						)
					);
				}}
			/>
			<Grid item xs={12}>
				<Button
					sx={{ width: '100%' }}
					variant='contained'
					onClick={() => watchedObject.calculate()}>
					Calculate
				</Button>
			</Grid>
		</>
	);
};

const BoxDimensionsField = (props: {
	editor: Editor;
	object: BasicMesh | WorldZone | DetectGeometry | Object3D;
}) => {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const getRenderFlag = useCallback(() => {
		if (isBasicMesh(watchedObject) && watchedObject.geometryType === 'Box') return true;

		if (isWorldZone(watchedObject) && watchedObject.geometryType === 'Box')
			return !watchedObject.autoCalculate;

		if (isDetectGeometry(watchedObject) && watchedObject.detectType === 'Mesh') return true;

		return false;
	}, [watchedObject]);

	const [renderFlag, setRenderFlag] = useState(getRenderFlag());

	const [box, setBox] = useState(new Vector3());

	const updateBox = useCallback(() => {
		if (isWorldZone(watchedObject)) setBox(watchedObject.size.clone());

		let v;
		if (isDetectGeometry(watchedObject)) v = watchedObject.geometryData;
		else if (isBoxMesh(watchedObject)) v = watchedObject.geometry.parameters;
		else return;
		setBox(new Vector3(v.width, v.height, v.depth));
	}, [watchedObject]);

	useEffect(() => {
		setRenderFlag(getRenderFlag());
	}, [getRenderFlag, watchedObject]);

	const handleChanged = useCallback(
		(v: Vector3) => {
			try {
				if (isDetectGeometry(watchedObject)) {
					const geometryData = {
						width: v.x,
						height: v.y,
						depth: v.z
					};

					return editor.execute(
						new SetDetectGeometryCommand(editor, watchedObject.object, geometryData)
					);
				}

				if (isWorldZone(watchedObject)) {
					return editor.execute(
						new SetValueCommand(editor, watchedObject.object, 'size', v)
					);
				}

				if (isBoxMesh(watchedObject)) {
					return editor.execute(
						new SetGeometryCommand(
							editor,
							watchedObject.object,
							new BoxGeometry(v.x, v.y, v.z)
						)
					);
				}
			} finally {
				updateBox();
			}
		},
		[editor, updateBox, watchedObject]
	);

	if (!getRenderFlag()) return <>{renderFlag}</>;

	return (
		<>
			<NumberPropertyField
				label='X side (width)'
				value={box.x}
				unit={editor.unit.name}
				min={0}
				onChange={v => {
					handleChanged(new Vector3(v, box.y, box.z));
				}}
			/>
			<NumberPropertyField
				label='Y side (height)'
				value={box.y}
				unit={editor.unit.name}
				min={0}
				onChange={v => {
					handleChanged(new Vector3(box.x, v, box.z));
				}}
			/>
			<NumberPropertyField
				label='Z side (depth)'
				value={box.z}
				unit={editor.unit.name}
				min={0}
				onChange={v => {
					handleChanged(new Vector3(box.x, box.y, v));
				}}
			/>
		</>
	);
};

const DimensionsFields = (props: { editor: Editor; object: Object3D }) => {
	const { object, editor } = props;

	return (
		<>
			<BoxDimensionsField editor={editor} object={object} />

			<NumberPropertyField
				label='Radius'
				value={object.scale.x}
				unit={editor.unit.name}
				min={0}
				onChange={function (value: number): void {
					throw new Error('Function not implemented.');
				}}
			/>
			<NumberPropertyField
				label='Inner radius'
				value={object.scale.x}
				unit={editor.unit.name}
				min={0}
				onChange={function (value: number): void {
					throw new Error('Function not implemented.');
				}}
			/>
			<SelectPropertyField
				label='Zone ID'
				value={'a'}
				options={['a', 'b', 'c']}
				onChange={a => console.log(a)}
			/>
		</>
	);
};

export function ObjectDimensions(props: {
	editor: Editor;
	object: BasicMesh | DetectGeometry | WorldZone;
}) {
	const { object, editor } = props;

	const visibleFlag = isBasicMesh(object) || isDetectGeometry(object) || isWorldZone(object);

	return (
		<PropertiesCategory category='Dimensions' visible={visibleFlag}>
			<ObjectTypeField editor={editor} object={object} />

			<DimensionsFields editor={editor} object={object} />

			{isWorldZone(object) && <WorldZoneCalculateField editor={editor} object={object} />}
		</PropertiesCategory>
	);
}
