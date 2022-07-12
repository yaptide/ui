import * as CSG from '../../../util/CSG/CSG';
import { createRowText, createZoneRulesPanel } from '../../../util/Ui/Uis';
import { Editor } from '../../Editor';
import { UIRow, UIText } from '../../libs/ui';
import { ObjectAbstract } from './Panel.Abstract';

export class ObjectCSG extends ObjectAbstract {
	object?: CSG.Zone;

	typeRow: UIRow;
	type: UIText;

	zoneRulesRow: UIRow;
	renderZoneRules: (zone: CSG.Zone) => void;

	constructor(editor: Editor) {
		super(editor, 'Zone Operations');

		[this.typeRow, this.type] = createRowText({ text: 'Geometry Type', value: 'CSG' });
		[this.zoneRulesRow, this.renderZoneRules] = createZoneRulesPanel(this.editor);

		this.panel.add(this.typeRow, this.zoneRulesRow);
	}
	setObject(object: CSG.Zone): void {
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
