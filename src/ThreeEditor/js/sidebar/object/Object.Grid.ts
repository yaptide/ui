import { DetectGeometry } from '../../../util/Detect/DetectGeometry';
import { createRowParamNumber, hideUIElement, showUIElement } from '../../../util/Ui/Uis';
import { SetDetectGeometryCommand } from '../../commands/Commands';
import { Editor } from '../../Editor';
import { UINumber, UIRow } from '../../libs/ui';
import { ObjectAbstract } from './Object.Abstract';
export class ObjectGrid extends ObjectAbstract {
	object?: DetectGeometry;

	xLengthRow: UIRow;
	xLength: UINumber;

	yLengthRow: UIRow;
	yLength: UINumber;

	zLengthRow: UIRow;
	zLength: UINumber;

	radiusRow: UIRow;
	radius: UINumber;

	constructor(editor: Editor) {
		super(editor, 'Grid');

		[this.xLengthRow, this.xLength] = createRowParamNumber({
			update: this.update.bind(this),
			text: `number of bins along X axis`,
			min: 1,
			max: 1000000,
			precision: 0
		});
		[this.yLengthRow, this.yLength] = createRowParamNumber({
			update: this.update.bind(this),
			text: `number of bins along Y axis`,
			min: 1,
			max: 1000000,
			precision: 0
		});
		[this.zLengthRow, this.zLength] = createRowParamNumber({
			update: this.update.bind(this),
			text: `number of bins along Z axis`,
			min: 1,
			max: 1000000,
			precision: 0
		});
		[this.radiusRow, this.radius] = createRowParamNumber({
			update: this.update.bind(this),
			text: `number of bins along the radius`,
			min: 1,
			max: 1000000,
			precision: 0
		});
		this.panel.add(this.xLengthRow, this.yLengthRow, this.zLengthRow, this.radiusRow);
	}

	setObject(object: DetectGeometry): void {
		super.setObject(object);
		if (!this.object) return;

		const { detectType, geometryData } = object;
		hideUIElement(this.xLengthRow);
		hideUIElement(this.yLengthRow);
		hideUIElement(this.zLengthRow);
		hideUIElement(this.radiusRow);
		switch (detectType) {
			case 'Mesh':
				showUIElement(this.xLengthRow);
				showUIElement(this.yLengthRow);
				showUIElement(this.zLengthRow);
				this.xLength.setValue(geometryData.xSegments);
				this.yLength.setValue(geometryData.ySegments);
				this.zLength.setValue(geometryData.zSegments);
				break;
			case 'Cyl':
				showUIElement(this.zLengthRow);
				showUIElement(this.radiusRow);
				this.zLength.setValue(geometryData.zSegments);
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
						xSegments: this.xLength.getValue(),
						ySegments: this.yLength.getValue(),
						zSegments: this.zLength.getValue()
					})
				);
				break;
			case 'Cyl':
				editor.execute(
					new SetDetectGeometryCommand(editor, object, {
						radialSegments: this.radius.getValue(),
						zSegments: this.zLength.getValue()
					})
				);
				break;
			default:
				break;
		}
	}
}
