import { hideUIElement, showUIElement } from '../../../util/Ui/Uis';
import { Editor } from '../../Editor';
import { UIPanel, UIRow, UIText } from '../../libs/ui';

export abstract class ObjectAbstract {
	object?: unknown;
	editor: Editor;
	title: UIText;
	titleRow: UIRow;
	panel: UIPanel;
	constructor(editor: Editor, title: string) {
		this.editor = editor;
		this.title = new UIText(title.toUpperCase());
		this.titleRow = new UIRow();
		this.titleRow.add(this.title);
		this.panel = new UIPanel();
		this.panel.add(this.titleRow);
	}
	setObject(object: unknown): void {
		this.object = object;
		object ? showUIElement(this.panel) : hideUIElement(this.panel);
	}
}
