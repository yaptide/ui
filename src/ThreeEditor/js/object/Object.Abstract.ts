import { Editor } from '../Editor';
import { UIElement, UIPanel, UIRow, UIText } from '../libs/ui';

export abstract class ObjectAbstract {
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
	abstract setObject(object: unknown): void;
	abstract update(): void;
}
