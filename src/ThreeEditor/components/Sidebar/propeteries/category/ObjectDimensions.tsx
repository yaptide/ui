import { BoxGeometry, Object3D, Vector3 } from 'three';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { Editor } from '../../../../js/Editor';
import {
	BooleanPropertyField,
	LabelPropertyField,
	NumberPropertyField,
	SelectPropertyField,
	TextPropertyField
} from '../PropertyField';
import { useCallback, useEffect, useState } from 'react';
import { useSignalObjectChanged, useSignal } from '../../../../util/hooks/signals';
import { PropertiesCategory } from './PropertiesCategory';
import { Button, Divider, Grid } from '@mui/material';
import {
	BasicMesh,
	BASIC_GEOMETRY_OPTIONS,
	BoxMesh,
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

	const getSelectData = useCallback(() => {
		if (isDetectGeometry(object)) return { options: DETECT_OPTIONS, value: object.detectType };
		return { options: BASIC_GEOMETRY_OPTIONS, value: object.geometryType };
	}, [object]);

	const [selectData, setSelectData] = useState(getSelectData());

	useEffect(() => {
		setSelectData(getSelectData());
	}, [getSelectData, object]);

	const onChange = useCallback(
		(value: string) => {
			if (isDetectGeometry(object))
				return editor.execute(new SetDetectTypeCommand(editor, object, value));

			if (isWorldZone(object))
				return editor.execute(new SetValueCommand(editor, object, 'geometryType', value));
		},
		[editor, object]
	);

	const handleUpdate = useCallback(
		(_: Object3D, property: string) => {
			if (property === 'geometryType') setSelectData(getSelectData());
		},
		[getSelectData]
	);

	useSignalObjectChanged(editor, handleUpdate);

	const handleUpdateDetect = useCallback(() => {
		setSelectData(getSelectData());
	}, [getSelectData]);

	useSignal(editor, 'detectTypeChanged', handleUpdateDetect);

	const typeSelectable = !isBasicMesh(object);
	const renderFlag = isBasicMesh(object) || isDetectGeometry(object) || isWorldZone(object);
	if (!renderFlag) return null;

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
				<LabelPropertyField label='Geometry Type' value={object.geometryType} />
			)}
		</>
	);
};

const WorldZoneCalculateField = (props: { editor: Editor; object: WorldZone }) => {
	const { object, editor } = props;

	const [currentValue, setCurrentValue] = useState(object.autoCalculate);
	const [renderFlag, setRenderFlag] = useState(object.geometryType === 'Box');

	const handleUpdate = useCallback(
		(_: Object3D, property: string) => {
			if (property === 'autoCalculate') setCurrentValue(object.autoCalculate);
			if (property === 'geometryType') setRenderFlag(object.geometryType === 'Box');
		},
		[object]
	);

	useEffect(() => {
		setCurrentValue(object.autoCalculate);
		setRenderFlag(object.geometryType === 'Box');
	}, [object]);

	useSignalObjectChanged(editor, handleUpdate);

	if (!renderFlag) return null;

	return (
		<>
			<Grid item xs={12}>
				<Divider />
			</Grid>
			<BooleanPropertyField
				label='Automatic'
				value={currentValue}
				onChange={value => {
					editor.execute(
						new SetValueCommand(editor, object, 'autoCalculate', value, true)
					);
				}}
			/>
			<Grid item xs={12}>
				<Button
					sx={{ width: '100%' }}
					variant='contained'
					onClick={() => object.calculate()}>
					Calculate
				</Button>
			</Grid>
		</>
	);
};

const BoxDimensionsField = (props: { editor: Editor; object: Object3D }) => {
	const { object, editor } = props;

	const getRenderFlag = useCallback(() => {
		if (isBasicMesh(object) && object.geometryType === 'Box') return true;

		if (isWorldZone(object) && object.geometryType === 'Box') return !object.autoCalculate;

		if (isDetectGeometry(object) && object.detectType === 'Mesh') return true;

		return false;
	}, [object]);

	const [renderFlag, setRenderFlag] = useState(getRenderFlag());

	const [box, setBox] = useState(new Vector3());

	const updateBox = useCallback(() => {
		if (isWorldZone(object)) setBox(object.size.clone());

		let v;
		if (isDetectGeometry(object)) v = object.geometryData;
		else if (isBoxMesh(object)) v = object.geometry.parameters;
		else return;
		setBox(new Vector3(v.width, v.height, v.depth));
	}, [object]);

	const handleUpdate = useCallback(
		(_: Object3D, property: string) => {
			if (['geometryType', 'detectType', 'autoCalculate', 'size'].includes(property)) {
				updateBox();
				setRenderFlag(getRenderFlag());
			}
		},
		[getRenderFlag, updateBox]
	);

	useSignalObjectChanged(editor, handleUpdate);

	const handleGeometryUpdate = useCallback(() => {
		updateBox();
		setRenderFlag(getRenderFlag());
	}, [getRenderFlag, updateBox]);

	useSignal(editor, ['geometryChanged', 'detectTypeChanged'], handleGeometryUpdate);

	useEffect(() => {
		setRenderFlag(getRenderFlag());
		updateBox();
	}, [getRenderFlag, object, updateBox]);

	const handleChanged = useCallback(
		(v: Vector3) => {
			if (isDetectGeometry(object)) {
				const geometryData = {
					width: v.x,
					height: v.y,
					depth: v.z
				};

				return editor.execute(new SetDetectGeometryCommand(editor, object, geometryData));
			}

			if (isWorldZone(object)) {
				return editor.execute(new SetValueCommand(editor, object, 'size', v));
			}

			if (isBoxMesh(object)) {
				return editor.execute(
					new SetGeometryCommand(editor, object, new BoxGeometry(v.x, v.y, v.z))
				);
			}
		},
		[editor, object]
	);

	if (!renderFlag) return <>{renderFlag}</>;

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
	const [name, setName] = useState(object.name);

	const update = useCallback(() => {
		setName(object.name);
	}, [object.name]);

	useSignalObjectChanged(editor, update);

	return (
		<PropertiesCategory category='Dimensions'>
			<ObjectTypeField editor={editor} object={object} />

			<DimensionsFields editor={editor} object={object} />

			{isWorldZone(object) && <WorldZoneCalculateField editor={editor} object={object} />}
		</PropertiesCategory>
	);
}
