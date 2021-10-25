import { SetMaterialValueCommand } from './commands/Commands';
import { UICheckbox, UIRow, UIText } from './libs/ui.js';

function SidebarMaterialBooleanProperty(editor, property, name) {

	const { signals } = editor;

	const container = new UIRow();
	container.add(new UIText(name).setWidth('90px'));

	const boolean = new UICheckbox().setLeft('100px').onChange(onChange);
	container.add(boolean);

	let object = null;
	let material = null;

	function onChange() {

		if (material[property] !== boolean.getValue()) {

			editor.execute(new SetMaterialValueCommand(editor, object, property, boolean.getValue(), 0 /* TODO: currentMaterialSlot */));

		}

	}

	function update() {

		if (object === null) return;
		if (object.material === undefined) return;

		material = object.material;

		if (property in material) {

			boolean.setValue(material[property]);
			container.setDisplay('');

		} else {

			container.setDisplay('none');

		}

	}

	//

	signals.objectSelected.add((selected) => {

		object = selected;

		update();

	});

	signals.materialChanged.add(update);

	return container;

}

export { SidebarMaterialBooleanProperty };

