import { hideUIElement, showUIElement } from '../../../../util/Ui/Uis';
import { YaptideEditor } from '../../YaptideEditor';
import { UIPanel, UIRow, UIText } from '../../libs/ui';

export abstract class ObjectAbstract {
	editor: YaptideEditor;
	title: UIText;
	titleRow: UIRow;
	panel: UIPanel;
	constructor(editor: YaptideEditor, title: string) {
		this.editor = editor;
		this.title = new UIText(title.toUpperCase());
		this.titleRow = new UIRow();
		this.titleRow.add(this.title);
		this.panel = new UIPanel();
		this.panel.add(this.titleRow);
	}

	setObject(object: unknown): void {
		object ? showUIElement(this.panel) : hideUIElement(this.panel);
	}

	abstract update(): void;
}
