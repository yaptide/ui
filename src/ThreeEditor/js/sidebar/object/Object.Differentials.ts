import { Editor } from '../../Editor';
import { ObjectAbstract } from './Object.Abstract';

export class ObjectDifferentials extends ObjectAbstract {
	update(): void {
		throw new Error('Method not implemented.');
	}
	constructor(editor: Editor) {
		super(editor, 'Differential scoring');
	}
}
