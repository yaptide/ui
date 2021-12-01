//GRID DENSITY
//WIDTH DENSITY
//HEIGHT DENSITY
//DEPTH DENSITY

import { DetectGeometry } from '../../util/Detect/DetectGeometry';
import { createRowParamNumber, hideUIElement, showUIElement } from '../../util/UiUtils';
import { SetDetectGeometryCommand } from '../commands/Commands';
import { Editor } from '../Editor';
import { UINumber, UIRow } from '../libs/ui';
import { ObjectAbstract } from './Object.Abstract';

//RADIAL DENSITY
export class ObjectGrid extends ObjectAbstract {
	object?: DetectGeometry;

	widthRow: UIRow;
	width: UINumber;

	heightRow: UIRow;
	height: UINumber;

	depthRow: UIRow;
	depth: UINumber;

	radiusRow: UIRow;
	radius: UINumber;

	constructor(editor: Editor) {
		super(editor, 'Grid');

		[this.widthRow, this.width] = createRowParamNumber({
			update: this.update.bind(this),
			text: `number of bins along X axis`,
			min: 0,
			max: 10000,
			precision: 0
		});
		[this.heightRow, this.height] = createRowParamNumber({
			update: this.update.bind(this),
			text: `number of bins along Y axis`,
			min: 0,
			max: 10000,
			precision: 0
		});
		[this.depthRow, this.depth] = createRowParamNumber({
			update: this.update.bind(this),
			text: `number of bins along Z axis`,
			min: 0,
			max: 10000,
			precision: 0
		});
		[this.radiusRow, this.radius] = createRowParamNumber({
			update: this.update.bind(this),
			text: `number of bins around the radius of the grid`,
			min: 0,
			max: 10000,
			precision: 0
		});
		this.panel.add(this.widthRow, this.heightRow, this.depthRow, this.radiusRow);
	}

	setObject(object: DetectGeometry): void {
		this.object = object;
		const { detectType, geometryData } = object;
		hideUIElement(this.widthRow);
		hideUIElement(this.heightRow);
		hideUIElement(this.depthRow);
		hideUIElement(this.radiusRow);
		switch (detectType) {
			case 'Mesh':
				showUIElement(this.widthRow);
				showUIElement(this.heightRow);
				showUIElement(this.depthRow);
				this.width.setValue(geometryData.widthSegments);
				this.height.setValue(geometryData.heightSegments);
				this.depth.setValue(geometryData.depthSegments);
				break;
			case 'Cyl':
				showUIElement(this.depthRow);
				showUIElement(this.radiusRow);
				this.depth.setValue(geometryData.depthSegments);
				this.radius.setValue(geometryData.radialSegments);
				break;
			default:
				break;
		}
	}
	update(): void {
		const { editor, object } = this;
		if (!object) return;
		const { detectType } = object;
		switch (detectType) {
			case 'Mesh':
				editor.execute(
					new SetDetectGeometryCommand(editor, object, {
						widthSegments: this.width.getValue(),
						heightSegments: this.height.getValue(),
						depthSegments: this.depth.getValue()
					})
				);
				break;
			case 'Cyl':
				editor.execute(
					new SetDetectGeometryCommand(editor, object, {
						radialSegments: this.radius.getValue(),
						depthSegments: this.depth.getValue()
					})
				);
				break;
			default:
				break;
		}
	}
}
