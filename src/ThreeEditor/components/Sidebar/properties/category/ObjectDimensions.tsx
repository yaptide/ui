import { Button, Divider, Grid } from '@mui/material';
import { useCallback } from 'react';
import { BoxGeometry, CylinderGeometry, Object3D, SphereGeometry, Vector3 } from 'three';
import { SetDetectGeometryCommand } from '../../../../js/commands/SetDetectGeometryCommand';
import { SetDetectTypeCommand } from '../../../../js/commands/SetDetectTypeCommand';
import { SetGeometryCommand } from '../../../../js/commands/SetGeometryCommand';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { Editor } from '../../../../js/Editor';
import {
	BasicMesh,
	BASIC_GEOMETRY_OPTIONS,
	isBasicMesh,
	isBoxMesh,
	isCTMesh,
	isCylinderMesh,
	isSphereMesh
} from '../../../../util/BasicMeshes';
import { DetectGeometry, isDetectGeometry } from '../../../../util/Detect/DetectGeometry';
import { CylData, DETECT_OPTIONS } from '../../../../util/Detect/DetectTypes';
import { useSmartWatchEditorState } from '../../../../util/hooks/signals';
import { isWorldZone, WorldZone } from '../../../../util/WorldZone/WorldZone';
import {
	ObjectSelectOptionType,
	ObjectSelectPropertyField
} from '../fields/ObjectSelectPropertyField';
import {
	BooleanPropertyField,
	LabelPropertyField,
	NumberPropertyField,
	SelectPropertyField
} from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

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
				<LabelPropertyField
					label='Geometry Type'
					value={watchedObject.geometryType}
				/>
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
			<Grid
				item
				xs={12}>
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
			<Grid
				item
				xs={12}>
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

	const getBox = useCallback(() => {
		if (isWorldZone(watchedObject)) return watchedObject.size.clone();

		let v;
		if (isDetectGeometry(watchedObject)) v = watchedObject.geometryData;
		else if (isBoxMesh(watchedObject)) v = watchedObject.geometry.parameters;
		else return new Vector3(0, 0, 0);
		return new Vector3(v.width, v.height, v.depth);
	}, [watchedObject]);

	const handleChanged = useCallback(
		(v: Vector3) => {
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
				return editor.execute(new SetValueCommand(editor, watchedObject.object, 'size', v));
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
		},
		[editor, watchedObject]
	);

	if (!getRenderFlag()) return null;

	return (
		<>
			<NumberPropertyField
				label='X side (width)'
				value={getBox().x}
				unit={editor.unit.name}
				min={0}
				onChange={v => {
					handleChanged(new Vector3(v, getBox().y, getBox().z));
				}}
			/>
			<NumberPropertyField
				label='Y side (height)'
				value={getBox().y}
				unit={editor.unit.name}
				min={0}
				onChange={v => {
					handleChanged(new Vector3(getBox().x, v, getBox().z));
				}}
			/>
			<NumberPropertyField
				label='Z side (depth)'
				value={getBox().z}
				unit={editor.unit.name}
				min={0}
				onChange={v => {
					handleChanged(new Vector3(getBox().x, getBox().y, v));
				}}
			/>
		</>
	);
};

const CylinderDimensionsField = (props: {
	editor: Editor;
	object: BasicMesh | WorldZone | DetectGeometry | Object3D;
}) => {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const getRenderFlag = useCallback(() => {
		if (isBasicMesh(watchedObject) && watchedObject.geometryType === 'Cylinder') return true;

		if (isWorldZone(watchedObject) && watchedObject.geometryType === 'Cylinder')
			return !watchedObject.autoCalculate;

		if (isDetectGeometry(watchedObject) && watchedObject.detectType === 'Cyl') return true;

		return false;
	}, [watchedObject]);

	const getCylinder = useCallback(() => {
		if (isWorldZone(watchedObject)) {
			const { size } = watchedObject;
			return { radius: size.x, innerRadius: 0, height: size.z };
		} else if (isDetectGeometry(watchedObject)) {
			const parameters = watchedObject.geometryData as CylData;
			return {
				radius: parameters.radius,
				innerRadius: parameters.innerRadius,
				height: parameters.depth
			};
		} else if (isCylinderMesh(watchedObject)) {
			const parameters = watchedObject.geometry.parameters;
			return {
				radius: parameters.radiusTop,
				innerRadius: 0,
				height: parameters.height
			};
		}
		return { radius: 0, innerRadius: 0, height: 0 };
	}, [watchedObject]);

	const handleChanged = useCallback(
		(v: ReturnType<typeof getCylinder>) => {
			if (isDetectGeometry(watchedObject)) {
				const geometryData = {
					radius: v.radius,
					innerRadius: v.innerRadius,
					depth: v.height
				};
				return editor.execute(
					new SetDetectGeometryCommand(editor, watchedObject.object, geometryData)
				);
			}

			if (isWorldZone(watchedObject)) {
				return editor.execute(
					new SetValueCommand(
						editor,
						watchedObject.object,
						'size',
						new Vector3(v.radius, v.radius, v.height)
					)
				);
			}

			if (isCylinderMesh(watchedObject)) {
				const { radius, height } = v;
				editor.execute(
					new SetGeometryCommand(
						editor,
						watchedObject.object,
						new CylinderGeometry(
							radius,
							radius,
							height,
							16,
							1,
							false,
							0,
							Math.PI * 2
						).rotateX(Math.PI / 2)
					)
				);
			}
		},
		[editor, watchedObject]
	);

	if (!getRenderFlag()) return null;

	return (
		<>
			<NumberPropertyField
				label='Z side (depth)'
				value={getCylinder().height}
				unit={editor.unit.name}
				min={0}
				onChange={v => {
					handleChanged({ ...getCylinder(), height: v });
				}}
			/>
			<NumberPropertyField
				label='Radius'
				value={getCylinder().radius}
				unit={editor.unit.name}
				min={0}
				onChange={v => {
					handleChanged({ ...getCylinder(), radius: v });
				}}
			/>
			{isDetectGeometry(watchedObject) && (
				<NumberPropertyField
					label='Inner radius'
					value={getCylinder().innerRadius}
					unit={editor.unit.name}
					min={0}
					onChange={v => {
						handleChanged({ ...getCylinder(), innerRadius: v });
					}}
				/>
			)}
		</>
	);
};

const SphereDimensionsField = (props: {
	editor: Editor;
	object: BasicMesh | WorldZone | Object3D;
}) => {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const getRenderFlag = useCallback(() => {
		if (isBasicMesh(watchedObject) && watchedObject.geometryType === 'Sphere') return true;

		if (isWorldZone(watchedObject) && watchedObject.geometryType === 'Sphere')
			return !watchedObject.autoCalculate;
		return false;
	}, [watchedObject]);

	const getSphere = useCallback(() => {
		if (isWorldZone(watchedObject)) {
			const { size } = watchedObject;
			return { radius: size.x };
		} else if (isSphereMesh(watchedObject))
			return { radius: watchedObject.geometry.parameters.radius };
		return { radius: 0 };
	}, [watchedObject]);

	const handleChanged = useCallback(
		(v: ReturnType<typeof getSphere>) => {
			if (isWorldZone(watchedObject)) {
				return editor.execute(
					new SetValueCommand(
						editor,
						watchedObject.object,
						'size',
						new Vector3(v.radius, v.radius, v.radius)
					)
				);
			}

			if (isSphereMesh(watchedObject)) {
				const { radius } = v;
				editor.execute(
					new SetGeometryCommand(
						editor,
						watchedObject.object,
						new SphereGeometry(radius, 16, 8, 0, Math.PI * 2, 0, Math.PI)
					)
				);
			}
		},
		[editor, watchedObject]
	);

	if (!getRenderFlag()) return null;

	return (
		<>
			<NumberPropertyField
				label='Radius'
				value={getSphere().radius}
				unit={editor.unit.name}
				min={0}
				onChange={v => {
					handleChanged({ radius: v });
				}}
			/>
		</>
	);
};

const ZoneDimensionsField = (props: { editor: Editor; object: DetectGeometry | Object3D }) => {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object as DetectGeometry);

	const getRenderFlag = useCallback(() => {
		if (isDetectGeometry(watchedObject) && watchedObject.detectType === 'Zone') return true;
		return false;
	}, [watchedObject]);

	const handleChanged = useCallback(
		(v: ObjectSelectOptionType) => {
			if (isDetectGeometry(watchedObject)) {
				editor.execute(
					new SetDetectGeometryCommand(editor, watchedObject.object, { zoneUuid: v.uuid })
				);
			}
		},
		[editor, watchedObject]
	);

	if (!getRenderFlag()) return null;

	return (
		<>
			<ObjectSelectPropertyField
				label='Zone ID'
				value={watchedObject.geometryData.zoneUuid}
				onChange={handleChanged}
				options={editor.zoneManager.getZoneOptions()}
			/>
		</>
	);
};

const DimensionsFields = (props: { editor: Editor; object: Object3D }) => {
	const { object, editor } = props;

	return (
		<>
			<BoxDimensionsField
				editor={editor}
				object={object}
			/>
			<CylinderDimensionsField
				editor={editor}
				object={object}
			/>
			<SphereDimensionsField
				editor={editor}
				object={object}
			/>
			<ZoneDimensionsField
				editor={editor}
				object={object}
			/>
		</>
	);
};

export function ObjectDimensions(props: {
	editor: Editor;
	object: BasicMesh | DetectGeometry | WorldZone;
}) {
	const { object, editor } = props;

	const visibleFlag =
		!isCTMesh(object) &&
		(isBasicMesh(object) || isDetectGeometry(object) || isWorldZone(object));

	return (
		<PropertiesCategory
			category='Dimensions'
			visible={visibleFlag}>
			<ObjectTypeField
				editor={editor}
				object={object}
			/>

			<DimensionsFields
				editor={editor}
				object={object}
			/>

			{isWorldZone(object) && (
				<WorldZoneCalculateField
					editor={editor}
					object={object}
				/>
			)}
		</PropertiesCategory>
	);
}
