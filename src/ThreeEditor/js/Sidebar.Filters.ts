import { Signal } from 'signals';
import { Editor } from './Editor';
import { UISpan } from './libs/ui';

export class SidebarFilters extends UISpan{
    private editor: Editor;
    private signals = {

    }
    constructor(editor: Editor){
        super();
        this.editor = editor;
        this.signals = editor.signals;
    }   
}
