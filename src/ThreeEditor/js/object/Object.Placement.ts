//POSITION
//ROTATION
//DIRECTION (BEAM)

import * as THREE from 'three';
import { Beam, isBeam } from '../../util/Beam';
import { isZone } from '../../util/CSG/CSGZone';
import { SimulationObject3D } from '../../util/SimulationBase/SimulationMesh';
import { ISimulationObject } from '../../util/SimulationBase/SimulationObject';
import {
	createRowParamInput,
	createRowParamNumberXYZ,
	createRowText,
	hideUIElement,
	showUIElement
} from '../../util/UiUtils';
import { isWorldZone } from '../../util/WorldZone';
import {
	SetBeamDirectionCommand,
	SetPositionCommand,
	SetRotationCommand,
	SetValueCommand
} from '../commands/Commands';
import { Editor } from '../Editor';
import { UIElement, UIInput, UINumber, UIRow, UIText } from '../libs/ui';
import { ObjectAbstract } from './Object.Abstract';

export class ObjectPlacement extends ObjectAbstract {
	object?: SimulationObject3D | Beam;

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

	constructor(editor: Editor) {
		super(editor, 'Placement');

		[this.positionRow, this.positionX, this.positionY, this.positionZ] =
			createRowParamNumberXYZ({
				text: `Position ${editor.unit.name}`,
				update: this.update.bind(this)
			});

		[this.rotationRow, this.rotationX, this.rotationY, this.rotationZ] =
			createRowParamNumberXYZ({
				text: `Rotation [deg]`, //TODO: add multiple unit types to editor
				update: this.update.bind(this)
			});

		[this.directionRow, this.directionX, this.directionY, this.directionZ] =
			createRowParamNumberXYZ({
				text: `Direction ${editor.unit.name}`,
				update: this.update.bind(this)
			});

		this.panel.add(this.positionRow, this.rotationRow, this.directionRow);
	}

	private hasPosition(object: ISimulationObject): boolean {
		return !object.notMovable;
	}

	private hasRotation(object: ISimulationObject): boolean {
		return !object.notRotatable && !isBeam(object);
	}

	private hasDirection(object: ISimulationObject): object is Beam {
		return isBeam(object);
	}

	setObject(object: SimulationObject3D | Beam): void {
		this.object = object;
		if (this.hasPosition(object)) {
			showUIElement(this.positionRow);
			this.positionX.setValue(object.position.x);
			this.positionY.setValue(object.position.y);
			this.positionZ.setValue(object.position.z);
		} else {
			hideUIElement(this.positionRow);
		}
		if (this.hasRotation(object)) {
			showUIElement(this.rotationRow);
			this.rotationX.setValue(object.rotation.x);
			this.rotationY.setValue(object.rotation.y);
			this.rotationZ.setValue(object.rotation.z);
		} else {
			hideUIElement(this.rotationRow);
		}
		if (this.hasDirection(object)) {
			showUIElement(this.directionRow);
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
			let newPosition = new THREE.Vector3(
				this.positionX.getValue(),
				this.positionY.getValue(),
				this.positionZ.getValue()
			);
			if (object.position.distanceTo(newPosition) >= 0.01) {
				if (isWorldZone(object))
					this.editor.execute(new SetValueCommand(editor, object, 'center', newPosition));
				else this.editor.execute(new SetPositionCommand(editor, object, newPosition));
			}
		}
		if (this.hasRotation(object)) {
			let newRotation = new THREE.Euler(
				this.rotationX.getValue(),
				this.rotationY.getValue(),
				this.rotationZ.getValue()
			);
			if (!newRotation.equals(object.rotation))
				this.editor.execute(new SetRotationCommand(editor, object, newRotation));
		}
		if (this.hasDirection(object)) {
			let newDirection = new THREE.Vector3(
				this.directionX.getValue(),
				this.directionY.getValue(),
				this.directionZ.getValue()
			);
			if (!newDirection.equals(object.direction))
				this.editor.execute(new SetBeamDirectionCommand(editor, newDirection));
		}
	}
}
