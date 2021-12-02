import * as THREE from 'three';
import {
	BasicMesh,
	BASIC_GEOMETRY_OPTIONS,
	isBasicMesh,
	isBoxMesh,
	isCylinderMesh,
	isSphereMesh
} from '../../util/BasicMeshes';
import { DetectGeometry, isDetectGeometry } from '../../util/Detect/DetectGeometry';
import { DETECT_OPTIONS } from '../../util/Detect/DetectTypes';
import {
	createRowParamNumber,
	createRowSelect,
	createRowText,
	hideUIElement,
	showUIElement
} from '../../util/UiUtils';
import { isWorldZone, WorldZone } from '../../util/WorldZone';
import {
	SetDetectGeometryCommand,
	SetDetectTypeCommand,
	SetGeometryCommand,
	SetValueCommand
} from '../commands/Commands';
import { Editor } from '../Editor';
import { UINumber, UIRow, UISelect, UIText } from '../libs/ui';
import { ObjectAbstract } from './Object.Abstract';

export class ObjectDimensions extends ObjectAbstract {
	object?: BasicMesh | DetectGeometry | WorldZone;

	typeRow: UIRow;
	type: UIText;

	typeSelectRow: UIRow;
	typeSelect: UISelect;

	xLengthRow: UIRow;
	xLength: UINumber;

	yLengthRow: UIRow;
	yLength: UINumber;

	zLengthRow: UIRow;
	zLength: UINumber;

	radiusRow: UIRow;
	radius: UINumber;

	radiusRow2: UIRow;
	radius2: UINumber;

	zoneIdRow: UIRow;
	zoneId: UISelect;

	constructor(editor: Editor) {
		super(editor, 'Dimensions');

		[this.typeRow, this.type] = createRowText({ text: 'Geometry Type' });
		[this.typeSelectRow, this.typeSelect] = createRowSelect({
			update: this.updateType.bind(this),
			text: 'Geometry Type'
		});
		[this.xLengthRow, this.xLength] = createRowParamNumber({
			update: this.update.bind(this),
			text: `X side length (width) ${editor.unit.name}`,
			min: 0
		});
		[this.yLengthRow, this.yLength] = createRowParamNumber({
			update: this.update.bind(this),
			text: `Y side length (height) ${editor.unit.name}`,
			min: 0
		});
		[this.zLengthRow, this.zLength] = createRowParamNumber({
			update: this.update.bind(this),
			text: `Z side length (depth) ${editor.unit.name}`,
			min: 0
		});
		[this.radiusRow, this.radius] = createRowParamNumber({
			update: this.update.bind(this),
			text: `Radius ${editor.unit.name}`,
			min: 0
		});
		[this.radiusRow2, this.radius2] = createRowParamNumber({
			update: this.update.bind(this),
			text: `Inner radius ${editor.unit.name}`,
			min: 0
		});
		[this.zoneIdRow, this.zoneId] = createRowSelect({
			update: this.update.bind(this),
			text: 'Zone ID'
		});

		this.panel.add(
			this.typeRow,
			this.typeSelectRow,
			this.xLengthRow,
			this.yLengthRow,
			this.zLengthRow,
			this.radiusRow,
			this.radiusRow2,
			this.zoneIdRow
		);
	}

	private setGeometryType(object: BasicMesh | DetectGeometry | WorldZone): string | undefined {
		let geometryType;
		if (isBasicMesh(object)) {
			showUIElement(this.typeRow);
			hideUIElement(this.typeSelectRow);
			this.type.setValue(object.geometryType);
			geometryType = object.geometryType;
		} else {
			hideUIElement(this.typeRow);
			showUIElement(this.typeSelectRow);
			if (isWorldZone(object)) {
				this.typeSelect.setOptions(BASIC_GEOMETRY_OPTIONS);
				this.typeSelect.setValue(object.geometryType);
				geometryType = object.geometryType;
			} else if (isDetectGeometry(object)) {
				this.typeSelect.setOptions(DETECT_OPTIONS);
				this.typeSelect.setValue(object.detectType);
				geometryType = object.detectType;
			}
		}
		return geometryType;
	}

	private setBox(object: BasicMesh | DetectGeometry | WorldZone): void {
		showUIElement(this.xLengthRow);
		showUIElement(this.yLengthRow);
		showUIElement(this.zLengthRow);
		if (isWorldZone(object)) {
			if (object.autoCalculate) {
				hideUIElement(this.xLengthRow);
				hideUIElement(this.yLengthRow);
				hideUIElement(this.zLengthRow);
			} else {
				const { size } = object;
				this.xLength.setValue(size.x);
				this.yLength.setValue(size.y);
				this.zLength.setValue(size.z);
			}
		} else {
			let parameters;
			if (isDetectGeometry(object)) parameters = object.geometryData;
			else if (isBoxMesh(object)) parameters = object.geometry.parameters;
			else return;
			this.xLength.setValue(parameters.width);
			this.yLength.setValue(parameters.height);
			this.zLength.setValue(parameters.depth);
		}
	}

	private setSphere(object: BasicMesh | DetectGeometry | WorldZone): void {
		showUIElement(this.radiusRow);
		if (isWorldZone(object)) {
			const { size } = object;
			this.radius.setValue(size.x);
		} else {
			let parameters;
			if (isDetectGeometry(object)) parameters = { radius: object.geometryData.radius };
			else if (isSphereMesh(object)) parameters = object.geometry.parameters;
			else return;
			this.radius.setValue(parameters.radius);
		}
	}

	private setCylinder(object: BasicMesh | DetectGeometry | WorldZone): void {
		showUIElement(this.zLengthRow);
		showUIElement(this.radiusRow);
		if (isWorldZone(object)) {
			const { size } = object;
			this.radius.setValue(size.x);
			this.zLength.setValue(size.z);
		} else if (isDetectGeometry(object)) {
			showUIElement(this.radiusRow2);
			const parameters = object.geometryData;
			this.radius.setValue(parameters.radius);
			this.radius2.setValue(parameters.innerRadius);
			this.radius.min = parameters.innerRadius + 1e-5; // Prevent radius from being lower than innerRadius
			this.radius2.max = parameters.radius - 1e-5; // innerRadius cannot be greater than radius
			this.zLength.setValue(parameters.depth);
		} else if (isCylinderMesh(object)) {
			const parameters = object.geometry.parameters;
			this.radius.setValue(parameters.radiusTop);
			this.zLength.setValue(parameters.height);
		}
	}

	private setZoneId(): void {
		const { object } = this;
		if (!object) return;
		showUIElement(this.zoneIdRow);
		this.zoneId.setOptions(this.editor.zoneManager.getZoneOptions());
		if (isDetectGeometry(object)) {
			this.zoneId.setValue(object.geometryData.zoneId);
		}
	}

	setObject(object: BasicMesh | DetectGeometry | WorldZone): void {
		super.setObject(object);
		if (!object) return;

		this.object = object;
		const geometryType = this.setGeometryType(object);

		hideUIElement(this.xLengthRow);
		hideUIElement(this.yLengthRow);
		hideUIElement(this.zLengthRow);
		hideUIElement(this.radiusRow);
		hideUIElement(this.radiusRow2);
		hideUIElement(this.zoneIdRow);
		this.editor.signals.zoneAdded.remove(this.setZoneId);
		if (geometryType && geometryType !== 'All')
			if (['Box', 'Mesh'].includes(geometryType)) {
				this.setBox(object);
			} else if (geometryType === 'Sphere') {
				this.setSphere(object);
			} else if (['Cyl', 'Cylinder'].includes(geometryType)) {
				this.setCylinder(object);
			} else if (geometryType === 'Zone') {
				this.editor.signals.zoneAdded.add(this.setZoneId.bind(this));
				this.setZoneId();
			}
	}

	getBoxData(): { width: number; height: number; depth: number } {
		return {
			width: this.xLength.getValue(),
			height: this.yLength.getValue(),
			depth: this.zLength.getValue()
		};
	}

	getCylinderData(): { radius: number; innerRadius: number; depth: number } {
		return {
			radius: this.radius.getValue(),
			innerRadius: this.radius2.getValue(),
			depth: this.zLength.getValue()
		};
	}

	getSphereData(): { radius: number } {
		return {
			radius: this.radius.getValue()
		};
	}

	getZoneSize(geometryType: keyof typeof BASIC_GEOMETRY_OPTIONS): THREE.Vector3 | undefined {
		switch (geometryType) {
			case 'Box':
				return new THREE.Vector3(
					this.xLength.getValue(),
					this.yLength.getValue(),
					this.zLength.getValue()
				);
			case 'Sphere':
				return new THREE.Vector3(
					this.radius.getValue(),
					this.radius.getValue(),
					this.radius.getValue()
				);
			case 'Cylinder':
				return new THREE.Vector3(
					this.radius.getValue(),
					this.radius.getValue(),
					this.zLength.getValue()
				);
			default:
				return;
		}
	}

	update(): void {
		const { object, editor } = this;
		if (!object) return;
		if (isDetectGeometry(object)) {
			const { detectType } = object;
			let geometryData;
			switch (detectType) {
				case 'Mesh':
					geometryData = this.getBoxData();
					break;
				case 'Cyl':
					geometryData = this.getCylinderData();
					this.radius.min = geometryData.innerRadius + 1e-5; // Prevent radius from being lower than innerRadius
					this.radius2.max = geometryData.radius - 1e-5; // innerRadius cannot be greater than radius
					break;
				case 'Zone':
					geometryData = { zoneId: parseInt(this.zoneId.getValue()) };
					break;
				default:
					break;
			}
			editor.execute(new SetDetectGeometryCommand(editor, object, geometryData));
		} else if (isWorldZone(object)) {
			const { geometryType } = object;
			const size = this.getZoneSize(geometryType);
			editor.execute(new SetValueCommand(editor, object, 'size', size));
		} else {
			if (isBoxMesh(object)) {
				const { width, height, depth } = this.getBoxData();
				editor.execute(
					new SetGeometryCommand(
						editor,
						object,
						new THREE.BoxGeometry(width, height, depth)
					)
				);
			} else if (isSphereMesh(object)) {
				const { radius } = this.getSphereData();
				editor.execute(
					new SetGeometryCommand(
						editor,
						object,
						new THREE.SphereGeometry(radius, 16, 8, 0, Math.PI * 2, 0, Math.PI)
					)
				);
			} else if (isCylinderMesh(object)) {
				const { radius, depth } = this.getCylinderData();
				editor.execute(
					new SetGeometryCommand(
						editor,
						object,
						new THREE.CylinderGeometry(
							radius,
							radius,
							depth,
							16,
							1,
							false,
							0,
							Math.PI * 2
						).rotateX(Math.PI / 2)
					)
				);
			}
		}
	}

	updateType(): void {
		const { object, editor } = this;
		if (!object) return;
		if (isDetectGeometry(object))
			editor.execute(new SetDetectTypeCommand(editor, object, this.typeSelect.getValue()));
		else if (isWorldZone(object))
			editor.execute(
				new SetValueCommand(editor, object, 'geometryType', this.typeSelect.getValue())
			);
		this.setObject(object);
	}
}
