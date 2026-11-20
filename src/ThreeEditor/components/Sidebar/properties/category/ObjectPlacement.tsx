import { Euler, MathUtils, Vector3 } from 'three';

import { SimulationPropertiesType } from '../../../../../types/SimulationProperties';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';
import { getSetPositionCommand } from '../../../../../util/hooks/useKeyboardEditorControls';
import { SetBeamDirectionCommand } from '../../../../js/commands/SetBeamDirectionCommand';
import { SetRotationCommand } from '../../../../js/commands/SetRotationCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { SimulationElement } from '../../../../Simulation/Base/SimulationElement';
import { Beam, isBeam } from '../../../../Simulation/Physics/Beam';
import { Vector3PropertyField } from '../fields/PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export function ObjectPlacement(props: { editor: YaptideEditor; object: SimulationElement }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const hasPosition = (object: SimulationPropertiesType): boolean => {
		return !object.notMovable;
	};

	const hasRotation = (object: SimulationPropertiesType): boolean => {
		return !object.notRotatable && !isBeam(object);
	};

	const hasDirection = (object: SimulationPropertiesType): object is Beam => {
		return isBeam(object);
	};

	const updatePosition = (newPosition: Vector3) => {
		if (watchedObject && watchedObject.position.distanceTo(newPosition) >= 0.01)
			editor.execute(getSetPositionCommand(editor, watchedObject.object, newPosition));
	};

	const updateRotation = (rotation: Vector3) => {
		const newRotation = new Euler(
			rotation.x * MathUtils.DEG2RAD,
			rotation.y * MathUtils.DEG2RAD,
			rotation.z * MathUtils.DEG2RAD
		);

		if (!newRotation.equals(watchedObject.rotation))
			editor.execute(new SetRotationCommand(editor, watchedObject.object, newRotation));
	};

	const updateDirection = (newDirection: Vector3) => {
		if (hasDirection(watchedObject) && !newDirection.equals(watchedObject.direction))
			editor.execute(new SetBeamDirectionCommand(editor, newDirection));
	};

	const hasPlacement =
		hasPosition(watchedObject) || hasRotation(watchedObject) || hasDirection(watchedObject);

	return (
		<PropertiesCategory
			category={`Placement`}
			visible={hasPlacement}>
			{hasPosition(watchedObject) && (
				<Vector3PropertyField
					label='Position'
					value={watchedObject.position}
					onChange={updatePosition}
					unit={editor.unit.name}
				/>
			)}

			{hasRotation(watchedObject) && (
				<Vector3PropertyField
					label='Rotation'
					step={10}
					unit='°'
					precision={2}
					value={new Vector3()
						.setFromEuler(watchedObject.rotation)
						.multiplyScalar(MathUtils.RAD2DEG)}
					onChange={updateRotation}
				/>
			)}

			{hasDirection(watchedObject) && (
				<Vector3PropertyField
					label='Direction'
					value={watchedObject.direction}
					onChange={updateDirection}
					unit={editor.unit.name}
				/>
			)}
		</PropertiesCategory>
	);
}
