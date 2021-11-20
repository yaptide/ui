import { Signal } from 'signals';
import { DetectManager } from '../../util/Detect/DetectManager';
import { Editor } from '../Editor';
import { UISpan } from '../libs/ui';

export class SidebarFilters extends UISpan {
	private editor: Editor;
	private signals = {};
    private detectManager: DetectManager;
	constructor(editor: Editor) {
		super();
		this.editor = editor;
		this.signals = editor.signals;
        this.detectManager = editor.detectManager;
        
	}
}
