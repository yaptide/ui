import { createRowParamInput, createRowText } from '../../../util/Ui/Uis';
import { SetValueCommand } from '../../commands/Commands';
import { Editor } from '../../Editor';
import { UIInput, UIRow, UIText } from '../../libs/ui';
import { ObjectAbstract } from './Panel.Abstract';

export class ObjectInfo extends ObjectAbstract {
	object?: THREE.Object3D;

	idRow: UIRow;
	id: UIText;

	typeRow: UIRow;
	type: UIText;

	nameRow: UIRow;
	name: UIInput;

	constructor(editor: Editor) {
		super(editor, 'Information');
		[this.idRow, this.id] = createRowText({ text: 'ID' });
		[this.typeRow, this.type] = createRowText({ text: 'Type' });
		[this.nameRow, this.name] = createRowParamInput({
			text: 'Name',
			update: this.update.bind(this)
		});
		this.panel.add(this.idRow, this.typeRow, this.nameRow);
	}

	setObject(object: THREE.Object3D): void {
		super.setObject(object);
		if (!object) return;

		this.object = object;
		this.id.setValue(this.object.id.toString());
		this.type.setValue(this.object.type);
		this.name.setValue(this.object.name);
	}

	update(): void {
		if (this.object)
			this.editor.execute(
				new SetValueCommand(this.editor, this.editor.selected, 'name', this.name.getValue())
			);
	}
}
