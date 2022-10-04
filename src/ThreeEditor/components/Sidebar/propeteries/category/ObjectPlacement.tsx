import { Euler, MathUtils, Object3D, Vector3 } from 'three';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { Editor } from '../../../../js/Editor';
import { Vector3PropertyField } from '../PropertyField';
import { useCallback, useEffect, useState } from 'react';
import { ISimulationObject } from '../../../../util/SimulationBase/SimulationObject';
import { Beam, isBeam } from '../../../../util/Beam';
import { isWorldZone } from '../../../../util/WorldZone/WorldZone';
import { isDetectGeometry } from '../../../../util/Detect/DetectGeometry';
import { SetDetectPositionCommand } from '../../../../js/commands/SetDetectPositionCommand';
import { SetPositionCommand } from '../../../../js/commands/SetPositionCommand';
import { SetRotationCommand } from '../../../../js/commands/SetRotationCommand';
import { SetBeamDirectionCommand } from '../../../../js/commands/SetBeamDirectionCommand';
import { useReadEditorState, useSignalObjectChanged } from '../../../../util/hooks/signals';
import { PropertiesCategory } from './PropertiesCategory';

export function ObjectPlacement(props: { editor: Editor; object: Object3D }) {
	const { object, editor } = props;

	// const [position, setPosition] = useState<Vector3>();
	// const [rotation, setRotation] = useState<Euler>();
	// const [direction, setDirection] = useState<Vector3>();

	const { state: position } = useReadEditorState<Object3D, 'position'>(
		editor,
		object,
		'position'
	);

	const { state: rotation } = useReadEditorState<Object3D, 'rotation'>(
		editor,
		object,
		'rotation'
	);

	const { state: direction } = useReadEditorState<Beam, 'direction'>(
		editor,
		object as Beam,
		'direction'
	);

	const hasPosition = (object: ISimulationObject): boolean => {
		return !object.notMovable;
	};

	const hasRotation = (object: ISimulationObject): boolean => {
		return !object.notRotatable && !isBeam(object);
	};

	const hasDirection = (object: ISimulationObject): object is Beam => {
		return isBeam(object);
	};

	const updatePosition = (newPosition: Vector3) => {
		if (object && object.position.distanceTo(newPosition) >= 0.01) {
			if (isWorldZone(object))
				editor.execute(new SetValueCommand(editor, object, 'center', newPosition));
			else if (isDetectGeometry(object))
				editor.execute(new SetDetectPositionCommand(editor, object, newPosition));
			else editor.execute(new SetPositionCommand(editor, object, newPosition));
		}
	};

	const updateRotation = (rotation: Vector3) => {
		const newRotation = new Euler(
			rotation.x * MathUtils.DEG2RAD,
			rotation.y * MathUtils.DEG2RAD,
			rotation.z * MathUtils.DEG2RAD
		);
		if (!newRotation.equals(object.rotation))
			editor.execute(new SetRotationCommand(editor, object, newRotation));
	};

	const updateDirection = (newDirection: Vector3) => {
		if (hasDirection(object) && !newDirection.equals(object.direction))
			editor.execute(new SetBeamDirectionCommand(editor, newDirection));
	};

	const hasPlacement = hasPosition(object) || hasRotation(object) || hasDirection(object);

	return (
		<PropertiesCategory category={`Placement`} visible={hasPlacement}>
			{position && (
				<Vector3PropertyField
					label='Position'
					value={position}
					onChange={updatePosition}
					unit={editor.unit.name}
				/>
			)}

			{rotation && (
				<Vector3PropertyField
					label='Rotation'
					step={10}
					unit='°'
					precision={2}
					value={new Vector3().setFromEuler(rotation).multiplyScalar(MathUtils.RAD2DEG)}
					onChange={updateRotation}
				/>
			)}

			{direction && (
				<Vector3PropertyField
					label='Direction'
					value={direction}
					onChange={updateDirection}
					unit={editor.unit.name}
				/>
			)}
		</PropertiesCategory>
	);
}
