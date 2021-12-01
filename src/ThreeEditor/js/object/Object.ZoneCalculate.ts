import { createFullwidthButton, createRowCheckbox } from '../../util/UiUtils';
import { WorldZone } from '../../util/WorldZone';
import { SetValueCommand } from '../commands/Commands';
import { Editor } from '../Editor';
import { UIButton, UICheckbox, UIRow } from '../libs/ui';
import { ObjectAbstract } from './Object.Abstract';

export class ObjectZoneCalculate extends ObjectAbstract {
	object?: WorldZone;

	auto: UICheckbox;
	autoRow: UIRow;

	calculate: UIButton;
	calculateRow: UIRow;

	constructor(editor: Editor) {
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
	}

	setObject(object: WorldZone): void {
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
