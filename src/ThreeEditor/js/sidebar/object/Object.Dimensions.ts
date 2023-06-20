import * as THREE from 'three';

import { DETECTOR_OPTIONS } from '../../../../types/SimulationTypes/DetectTypes/DetectTypes';
import {
	createRowParamNumber,
	createRowSelect,
	createRowText,
	hideUIElement,
	showUIElement
} from '../../../../util/Ui/Uis';
import { HollowCylinderGeometry } from '../../../Simulation/Base/HollowCylinderGeometry';
import { Detector, isDetector } from '../../../Simulation/Detectors/Detector';
import {
	BASIC_GEOMETRY_OPTIONS,
	BasicFigure,
	isBasicFigure,
	isBoxFigure,
	isCylinderFigure,
	isSphereFigure
} from '../../../Simulation/Figures/BasicFigures';
import { isWorldZone, WorldZone } from '../../../Simulation/Zones/WorldZone/WorldZone';
import {
	SetDetectGeometryCommand,
	SetDetectTypeCommand,
	SetGeometryCommand,
	SetValueCommand
} from '../../commands/Commands';
import { UINumber, UIRow, UISelect, UIText } from '../../libs/ui';
import { YaptideEditor } from '../../YaptideEditor';
import { ObjectAbstract } from './Object.Abstract';

export class ObjectDimensions extends ObjectAbstract {
	object?: BasicFigure | Detector | WorldZone;

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

	zoneUuidRow: UIRow;
	zoneUuid: UISelect;

	constructor(editor: YaptideEditor) {
		super(editor, 'Dimensions');

		[this.typeRow, this.type] = createRowText({ text: 'Geometry Type' });
		[this.typeSelectRow, this.typeSelect] = createRowSelect({
			update: this.updateType.bind(this),
			text: 'Geometry Type'
		});
		[this.xLengthRow, this.xLength] = createRowParamNumber({
			update: this.update.bind(this),
			text: `X side (width)`,
			unit: `${editor.unit.name}`,
			min: 0
		});
		[this.yLengthRow, this.yLength] = createRowParamNumber({
			update: this.update.bind(this),
			text: `Y side (height)`,
			unit: `${editor.unit.name}`,
			min: 0
		});
		[this.zLengthRow, this.zLength] = createRowParamNumber({
			update: this.update.bind(this),
			text: `Z side (depth)`,
			unit: `${editor.unit.name}`,
			min: 0
		});
		[this.radiusRow, this.radius] = createRowParamNumber({
			update: this.update.bind(this),
			text: `Radius`,
			unit: `${editor.unit.name}`,
			min: 0
		});
		[this.radiusRow2, this.radius2] = createRowParamNumber({
			update: this.update.bind(this),
			text: `Inner radius`,
			unit: `${editor.unit.name}`,
			min: 0
		});
		[this.zoneUuidRow, this.zoneUuid] = createRowSelect({
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
			this.zoneUuidRow
		);
	}

	private setGeometryType(object: BasicFigure | Detector | WorldZone): string | undefined {
		let geometryType;
		if (isBasicFigure(object)) {
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
			} else if (isDetector(object)) {
				this.typeSelect.setOptions(DETECTOR_OPTIONS);
				this.typeSelect.setValue(object.detectorType);
				geometryType = object.detectorType;
			}
		}
		return geometryType;
	}

	private setBox(object: BasicFigure | Detector | WorldZone): void {
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
			if (isDetector(object)) parameters = object.geometryParameters;
			else if (isBoxFigure(object)) parameters = object.geometry.parameters;
			else return;
			this.xLength.setValue(parameters.width);
			this.yLength.setValue(parameters.height);
			this.zLength.setValue(parameters.depth);
		}
	}

	private setSphere(object: BasicFigure | Detector | WorldZone): void {
		showUIElement(this.radiusRow);
		if (isWorldZone(object)) {
			const { size } = object;
			this.radius.setValue(size.x);
		} else {
			let parameters;
			if (isDetector(object)) parameters = { radius: object.geometryParameters.radius };
			else if (isSphereFigure(object)) parameters = object.geometry.parameters;
			else return;
			this.radius.setValue(parameters.radius);
		}
	}

	private setCylinder(object: BasicFigure | Detector | WorldZone): void {
		showUIElement(this.zLengthRow);
		showUIElement(this.radiusRow);
		if (isWorldZone(object)) {
			const { size } = object;
			this.radius.setValue(size.x);
			this.zLength.setValue(size.z);
		} else if (isDetector(object)) {
			showUIElement(this.radiusRow2);
			const parameters = object.geometryParameters;
			this.radius.setValue(parameters.radius);
			this.radius2.setValue(parameters.innerRadius);
			this.radius.min = parameters.innerRadius + 1e-5; // Prevent radius from being lower than innerRadius
			this.radius2.max = parameters.radius - 1e-5; // innerRadius cannot be greater than radius
			this.zLength.setValue(parameters.depth);
		} else if (isCylinderFigure(object)) {
			console.log(object, object.geometry.parameters);
			const parameters = object.geometry.parameters;
			this.radius.setValue(parameters.outerRadius);
			this.zLength.setValue(parameters.height);
		}
	}

	private setZoneUuid(): void {
		const { object } = this;
		if (!object) return;
		showUIElement(this.zoneUuidRow);
		this.zoneUuid.setOptions(this.editor.zoneManager.getBooleanZoneOptions());
		if (isDetector(object)) {
			this.zoneUuid.setValue(object.geometryParameters.zoneUuid);
		}
	}

	setObject(object: BasicFigure | Detector | WorldZone): void {
		super.setObject(object);
		if (!object) return;

		this.object = object;
		const geometryType = this.setGeometryType(object);

		hideUIElement(this.xLengthRow);
		hideUIElement(this.yLengthRow);
		hideUIElement(this.zLengthRow);
		hideUIElement(this.radiusRow);
		hideUIElement(this.radiusRow2);
		hideUIElement(this.zoneUuidRow);
		this.editor.signals.zoneAdded.remove(this.setZoneUuid);
		if (geometryType && geometryType !== 'All')
			if (['Box', 'Mesh'].includes(geometryType)) {
				this.setBox(object);
			} else if (geometryType === 'Sphere') {
				this.setSphere(object);
			} else if (['Cyl', 'Cylinder'].includes(geometryType)) {
				this.setCylinder(object);
			} else if (geometryType === 'Zone') {
				this.editor.signals.zoneAdded.add(this.setZoneUuid.bind(this));
				this.setZoneUuid();
			}
	}

	getBoxData(): { width: number; height: number; depth: number } {
		return {
			width: this.xLength.getValue(),
			height: this.yLength.getValue(),
			depth: this.zLength.getValue()
		};
	}

	getCylinderData(): { outerRadius: number; innerRadius: number; height: number } {
		return {
			outerRadius: this.radius.getValue(),
			innerRadius: this.radius2.getValue(),
			height: this.zLength.getValue()
		};
	}

	getSphereData(): { radius: number } {
		return {
			radius: this.radius.getValue()
		};
	}

	getZoneSize(geometryType: keyof typeof BASIC_GEOMETRY_OPTIONS): THREE.Vector3 | undefined {
		switch (geometryType) {
			case 'BoxGeometry':
				return new THREE.Vector3(
					this.xLength.getValue(),
					this.yLength.getValue(),
					this.zLength.getValue()
				);
			case 'SphereGeometry':
				return new THREE.Vector3(
					this.radius.getValue(),
					this.radius.getValue(),
					this.radius.getValue()
				);
			case 'HollowCylinderGeometry':
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
		if (isDetector(object)) {
			const { detectorType: detectType } = object;
			let geometryData;
			switch (detectType) {
				case 'Mesh':
					geometryData = this.getBoxData();
					break;
				case 'Cyl':
					geometryData = this.getCylinderData();
					this.radius.min = geometryData.innerRadius + 1e-5; // Prevent radius from being lower than innerRadius
					this.radius2.max = geometryData.outerRadius - 1e-5; // innerRadius cannot be greater than radius
					break;
				case 'Zone':
					geometryData = { zoneUuid: this.zoneUuid.getValue() };
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
			if (isBoxFigure(object)) {
				const { width, height, depth } = this.getBoxData();
				editor.execute(
					new SetGeometryCommand(
						editor,
						object,
						new THREE.BoxGeometry(width, height, depth)
					)
				);
			} else if (isSphereFigure(object)) {
				const { radius } = this.getSphereData();
				editor.execute(
					new SetGeometryCommand(editor, object, new THREE.SphereGeometry(radius))
				);
			} else if (isCylinderFigure(object)) {
				const { outerRadius, innerRadius, height } = this.getCylinderData();
				editor.execute(
					new SetGeometryCommand(
						editor,
						object,
						new HollowCylinderGeometry(innerRadius, outerRadius, height, 16)
					)
				);
			}
		}
	}

	updateType(): void {
		const { object, editor } = this;
		if (!object) return;
		if (isDetector(object))
			editor.execute(new SetDetectTypeCommand(editor, object, this.typeSelect.getValue()));
		else if (isWorldZone(object))
			editor.execute(
				new SetValueCommand(editor, object, 'geometryType', this.typeSelect.getValue())
			);
		this.setObject(object);
	}
}
