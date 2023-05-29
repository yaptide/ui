import * as THREE from 'three';
import { Beam, isBeam } from '../../../Simulation/Physics/Beam';
import { isDetectGeometry } from '../../../Simulation/Detectors/Detector';
import { SimulationElement } from '../../../Simulation/Base/SimulationElement';
import { SimulationPropertiesType } from '../../../../types/SimulationProperties';
import { createRowParamNumberXYZ, hideUIElement, showUIElement } from '../../../../util/Ui/Uis';
import { isWorldZone } from '../../../Simulation/Zones/WorldZone/WorldZone';
import {
	SetBeamDirectionCommand,
	SetDetectPositionCommand,
	SetPositionCommand,
	SetRotationCommand,
	SetValueCommand
} from '../../commands/Commands';
import { YaptideEditor } from '../../Editor';
import { UINumber, UIRow } from '../../libs/ui';
import { ObjectAbstract } from './Object.Abstract';

export class ObjectPlacement extends ObjectAbstract {
	object?: SimulationElement | Beam;

	positionRow: UIRow;
	positionX: UINumber;
	positionY: UINumber;
	positionZ: UINumber;

	rotationRow: UIRow;
	rotationX: UINumber;
	rotationY: UINumber;
	rotationZ: UINumber;

	//Beam only parameter
	directionRow: UIRow;
	directionX: UINumber;
	directionY: UINumber;
	directionZ: UINumber;

	constructor(editor: YaptideEditor) {
		super(editor, 'Placement');

		[this.positionRow, this.positionX, this.positionY, this.positionZ] =
			createRowParamNumberXYZ({
				text: `Position`,
				unit: `${editor.unit.name}`,
				update: this.update.bind(this)
			});

		[this.rotationRow, this.rotationX, this.rotationY, this.rotationZ] =
			createRowParamNumberXYZ({
				text: `Rotation`, //TODO: add multiple unit types to editor
				update: this.update.bind(this),
				step: 10,
				nudge: 0.1,
				precision: 2,
				unit: '°'
			});

		[this.directionRow, this.directionX, this.directionY, this.directionZ] =
			createRowParamNumberXYZ({
				text: `Direction`,
				unit: `${editor.unit.name}`,
				update: this.update.bind(this)
			});

		this.panel.add(this.positionRow, this.rotationRow, this.directionRow);
	}

	private hasPosition(object: SimulationPropertiesType): boolean {
		return !object.notMovable;
	}

	private hasRotation(object: SimulationPropertiesType): boolean {
		return !object.notRotatable && !isBeam(object);
	}

	private hasDirection(object: SimulationPropertiesType): object is Beam {
		return isBeam(object);
	}

	setObject(object: SimulationElement | Beam): void {
		super.setObject(object);
		if (!object) return;

		this.object = object;
		if (this.hasPosition(object)) {
			showUIElement(this.positionRow, 'grid');
			this.positionX.setValue(object.position.x);
			this.positionY.setValue(object.position.y);
			this.positionZ.setValue(object.position.z);
		} else {
			hideUIElement(this.positionRow);
		}
		if (this.hasRotation(object)) {
			showUIElement(this.rotationRow, 'grid');
			this.rotationX.setValue(object.rotation.x * THREE.MathUtils.RAD2DEG);
			this.rotationY.setValue(object.rotation.y * THREE.MathUtils.RAD2DEG);
			this.rotationZ.setValue(object.rotation.z * THREE.MathUtils.RAD2DEG);
		} else {
			hideUIElement(this.rotationRow);
		}
		if (this.hasDirection(object)) {
			showUIElement(this.directionRow, 'grid');
			this.directionX.setValue(object.direction.x);
			this.directionY.setValue(object.direction.y);
			this.directionZ.setValue(object.direction.z);
		} else {
			hideUIElement(this.directionRow);
		}
	}

	update(): void {
		const { object, editor } = this;
		if (!object) return;
		if (this.hasPosition(object)) {
			const newPosition = new THREE.Vector3(
				this.positionX.getValue(),
				this.positionY.getValue(),
				this.positionZ.getValue()
			);
			if (object.position.distanceTo(newPosition) >= 0.01) {
				if (isWorldZone(object))
					this.editor.execute(new SetValueCommand(editor, object, 'center', newPosition));
				else if (isDetectGeometry(object))
					this.editor.execute(new SetDetectPositionCommand(editor, object, newPosition));
				else this.editor.execute(new SetPositionCommand(editor, object, newPosition));
			}
		}
		if (this.hasRotation(object)) {
			const newRotation = new THREE.Euler(
				this.rotationX.getValue() * THREE.MathUtils.DEG2RAD,
				this.rotationY.getValue() * THREE.MathUtils.DEG2RAD,
				this.rotationZ.getValue() * THREE.MathUtils.DEG2RAD
			);
			if (!newRotation.equals(object.rotation))
				this.editor.execute(new SetRotationCommand(editor, object, newRotation));
		}
		if (this.hasDirection(object)) {
			const newDirection = new THREE.Vector3(
				this.directionX.getValue(),
				this.directionY.getValue(),
				this.directionZ.getValue()
			);
			if (!newDirection.equals(object.direction))
				this.editor.execute(new SetBeamDirectionCommand(editor, newDirection));
		}
	}
}
