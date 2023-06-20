import {
	createFullwidthButton,
	createRowCheckbox,
	hideUIElement,
	showUIElement
} from '../../../../util/Ui/Uis';
import { WorldZone } from '../../../Simulation/Zones/WorldZone/WorldZone';
import { SetValueCommand } from '../../commands/Commands';
import { YaptideEditor } from '../../YaptideEditor';
import { UIButton, UICheckbox, UIRow } from '../../libs/ui';
import { ObjectAbstract } from './Object.Abstract';

export class ObjectZoneCalculate extends ObjectAbstract {
	object?: WorldZone;

	auto: UICheckbox;
	autoRow: UIRow;

	calculate: UIButton;
	calculateRow: UIRow;

	constructor(editor: YaptideEditor) {
		super(editor, 'Automatic');
		[this.autoRow, this.auto] = createRowCheckbox({
			text: 'Autocalculate',
			update: this.update.bind(this)
		});
		[this.calculateRow, this.calculate] = createFullwidthButton({
			text: 'Calculate',
			update: this.zoneCalculate.bind(this)
		});
		this.panel.add(this.autoRow, this.calculateRow);
		this.editor.signals.objectChanged.add((object: THREE.Object3D) =>
			(object === this.object &&
				object === this.editor.selected &&
				this.object.geometryType === 'BoxGeometry'
				? showUIElement
				: hideUIElement)(this.panel)
		);
	}

	setObject(object: WorldZone): void {
		super.setObject(object);
		if (!object) return;

		this.object = object;
		if (object.geometryType !== 'BoxGeometry') return hideUIElement(this.panel);
		this.object = object;
		this.auto.setValue(object.autoCalculate);
	}

	update(): void {
		const { editor, object } = this;
		editor.execute(
			new SetValueCommand(editor, object, 'autoCalculate', this.auto.getValue(), true)
		);
	}

	zoneCalculate(): void {
		const { object } = this;
		if (!object) return;
		object.calculate();
	}
}
