import { BooleanZone } from '../../../Simulation/Zones/BooleanZone';
import { createRowText, createZoneRulesPanel } from '../../../../util/Ui/Uis';
import { YaptideEditor } from '../../Editor';
import { UIRow, UIText } from '../../libs/ui';
import { ObjectAbstract } from './Object.Abstract';

export class ObjectCSG extends ObjectAbstract {
	object?: BooleanZone;

	typeRow: UIRow;
	type: UIText;

	zoneRulesRow: UIRow;
	renderZoneRules: (zone: BooleanZone) => void;

	constructor(editor: YaptideEditor) {
		super(editor, 'Zone Operations');

		[this.typeRow, this.type] = createRowText({ text: 'Geometry Type', value: 'CSG' });
		[this.zoneRulesRow, this.renderZoneRules] = createZoneRulesPanel(this.editor);

		this.panel.add(this.typeRow, this.zoneRulesRow);
	}
	setObject(object: BooleanZone): void {
		super.setObject(object);
		if (!object) return;

		this.object = object;
		this.render();
	}
	update(): void {
		throw new Error('Method not implemented.');
	}
	render(): void {
		if (!this.object) return;
		this.renderZoneRules(this.object);
	}
}
