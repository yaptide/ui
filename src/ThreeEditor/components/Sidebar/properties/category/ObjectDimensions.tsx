import { Button, Divider, Grid } from '@mui/material';
import { useCallback } from 'react';
import { BoxGeometry, SphereGeometry, Vector3 } from 'three';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { HollowCylinderGeometry } from '../../../../Simulation/Base/HollowCylinderGeometry';
import { Detector, isDetector } from '../../../../Simulation/Detectors/Detector';
import {
	BASIC_GEOMETRY_OPTIONS,
	BasicFigure,
	isBasicFigure,
	isBoxFigure,
	isCylinderFigure,
	isSphereFigure
} from '../../../../Simulation/Figures/BasicFigures';
import {
	BeamModulator,
	isBeamModulator
} from '../../../../Simulation/SpecialComponents/BeamModulator';
import { WorldZone, isWorldZone } from '../../../../Simulation/Zones/WorldZone/WorldZone';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { SetDetectGeometryCommand } from '../../../../js/commands/SetDetectGeometryCommand';
import { SetDetectTypeCommand } from '../../../../js/commands/SetDetectTypeCommand';
import { SetGeometryCommand } from '../../../../js/commands/SetGeometryCommand';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
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
import { isCTCube } from '../../../../Simulation/SpecialComponents/CTCube';
import {
	CylData,
	DETECTOR_OPTIONS
} from '../../../../../types/SimulationTypes/DetectTypes/DetectTypes';

const ObjectTypeField = (props: {
	editor: YaptideEditor;
	object: BasicFigure | Detector | WorldZone;
}) => {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const selectData = useCallback(() => {
		if (isDetector(watchedObject))
			return { options: DETECTOR_OPTIONS, value: watchedObject.detectorType };
		return { options: BASIC_GEOMETRY_OPTIONS, value: watchedObject.geometryType };
	}, [watchedObject])();

	const onChange = useCallback(
		(value: string) => {
			if (isDetector(watchedObject))
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

	const typeSelectable = isDetector(watchedObject) || isWorldZone(watchedObject);

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

const WorldZoneCalculateField = (props: { editor: YaptideEditor; object: WorldZone }) => {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const renderFlag = watchedObject.geometryType === 'BoxGeometry';
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
	editor: YaptideEditor;
	object: BasicFigure | WorldZone | Detector;
}) => {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const getRenderFlag = useCallback(() => {
		if (isBasicFigure(watchedObject) && watchedObject.geometryType === 'BoxGeometry')
			return true;

		if (isWorldZone(watchedObject) && watchedObject.geometryType === 'BoxGeometry')
			return !watchedObject.autoCalculate;

		if (isDetector(watchedObject) && watchedObject.detectorType === 'Mesh') return true;

		return false;
	}, [watchedObject]);

	const getBox = useCallback(() => {
		if (isWorldZone(watchedObject)) return watchedObject.size.clone();

		let v;
		if (isDetector(watchedObject)) v = watchedObject.geometryParameters;
		else if (isBoxFigure(watchedObject)) v = watchedObject.geometry.parameters;
		else return new Vector3(0, 0, 0);
		return new Vector3(v.width, v.height, v.depth);
	}, [watchedObject]);

	const handleChanged = useCallback(
		(v: Vector3) => {
			if (isDetector(watchedObject)) {
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

			if (isBoxFigure(watchedObject)) {
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
	editor: YaptideEditor;
	object: BasicFigure | WorldZone | Detector;
}) => {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const getRenderFlag = useCallback(() => {
		if (isBasicFigure(watchedObject) && watchedObject.geometryType === 'HollowCylinderGeometry')
			return true;

		if (isWorldZone(watchedObject) && watchedObject.geometryType === 'HollowCylinderGeometry')
			return !watchedObject.autoCalculate;

		if (isDetector(watchedObject) && watchedObject.detectorType === 'Cyl') return true;

		return false;
	}, [watchedObject]);

	const getCylinder = useCallback(() => {
		if (isWorldZone(watchedObject)) {
			const { size } = watchedObject;
			return { radius: size.x, innerRadius: 0, height: size.z };
		} else if (isDetector(watchedObject)) {
			const parameters = watchedObject.geometryParameters as CylData;
			return {
				radius: parameters.radius,
				innerRadius: parameters.innerRadius,
				height: parameters.depth
			};
		} else if (isCylinderFigure(watchedObject)) {
			const parameters = watchedObject.geometry.parameters;
			return {
				radius: parameters.outerRadius,
				innerRadius: 0,
				height: parameters.height
			};
		}
		return { radius: 0, innerRadius: 0, height: 0 };
	}, [watchedObject]);

	const handleChanged = useCallback(
		(v: ReturnType<typeof getCylinder>) => {
			if (isDetector(watchedObject)) {
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

			if (isCylinderFigure(watchedObject)) {
				const { radius, innerRadius, height } = v;
				editor.execute(
					new SetGeometryCommand(
						editor,
						watchedObject.object,
						new HollowCylinderGeometry(innerRadius, radius, height)
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
			{isDetector(watchedObject) && (
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
	editor: YaptideEditor;
	object: BasicFigure | WorldZone;
}) => {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const getRenderFlag = useCallback(() => {
		if (isBasicFigure(watchedObject) && watchedObject.geometryType === 'SphereGeometry')
			return true;

		if (isWorldZone(watchedObject) && watchedObject.geometryType === 'SphereGeometry')
			return !watchedObject.autoCalculate;
		return false;
	}, [watchedObject]);

	const getSphere = useCallback(() => {
		if (isWorldZone(watchedObject)) {
			const { size } = watchedObject;
			return { radius: size.x };
		} else if (isSphereFigure(watchedObject))
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

			if (isSphereFigure(watchedObject)) {
				const { radius } = v;
				editor.execute(
					new SetGeometryCommand(editor, watchedObject.object, new SphereGeometry(radius))
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

const ZoneDimensionsField = (props: {
	editor: YaptideEditor;
	object: Detector | BeamModulator;
}) => {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const getRenderFlag = useCallback(() => {
		if (isDetector(watchedObject) && watchedObject.detectorType === 'Zone') return true;
		if (isBeamModulator(watchedObject)) return true;
		return false;
	}, [watchedObject]);

	const handleChanged = useCallback(
		(v: ObjectSelectOptionType) => {
			if (isDetector(watchedObject)) {
				editor.execute(
					new SetDetectGeometryCommand(editor, watchedObject.object, { zoneUuid: v.uuid })
				);
			} else if (isBeamModulator(watchedObject)) {
				editor.execute(
					new SetValueCommand(editor, watchedObject.object, 'geometryParameters', {
						zoneUuid: v.uuid
					})
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
				value={watchedObject.geometryParameters.zoneUuid}
				onChange={handleChanged}
				options={editor.zoneManager.getZoneOptions()}
			/>
		</>
	);
};

const DimensionsFields = (props: {
	editor: YaptideEditor;
	object: BasicFigure | WorldZone | Detector | BeamModulator;
}) => {
	const { object, editor } = props;

	return (
		<>
			{!isBasicFigure(object) && !isWorldZone(object) && (
				<ZoneDimensionsField
					editor={editor}
					object={object}
				/>
			)}
			{!isBeamModulator(object) && (
				<>
					{!isDetector(object) && (
						<SphereDimensionsField
							editor={editor}
							object={object}
						/>
					)}
					<BoxDimensionsField
						editor={editor}
						object={object}
					/>
					<CylinderDimensionsField
						editor={editor}
						object={object}
					/>
				</>
			)}
		</>
	);
};

export function ObjectDimensions(props: {
	editor: YaptideEditor;
	object: BasicFigure | Detector | WorldZone;
}) {
	const { object, editor } = props;

	const visibleFlag =
		isDetector(object) ||
		isBeamModulator(object) ||
		(isBasicFigure(object) && !isCTCube(object)) ||
		isWorldZone(object);

	return (
		<PropertiesCategory
			category='Dimensions'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
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
				</>
			)}
		</PropertiesCategory>
	);
}
