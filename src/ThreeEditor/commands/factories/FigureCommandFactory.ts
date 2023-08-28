import { Editor } from '../../js/commands/AddObjectCommand';
import { YaptideEditor } from '../../js/YaptideEditor';
import { BasicFigure } from '../../Simulation/Figures/BasicFigures';
import { ObjectManagementFactory } from './ObjectManagementFactory';

export class FigureCommandFactory {
	managementFactory;
	editor: YaptideEditor;
	constructor(editor: Editor) {
		this.managementFactory = new ObjectManagementFactory(editor);
		this.editor = editor;
	}

	createAddFigureCommand = (figure: BasicFigure) =>
		this.managementFactory.createAddCommand('figure', figure, this.editor.figureManager);

	createRemoveFigureCommand = (figure: BasicFigure) =>
		this.managementFactory.createRemoveCommand('figure', figure, this.editor.figureManager);

	createDuplicateFigureCommand = (figure: BasicFigure) =>
		this.managementFactory.createDuplicateCommand('figure', figure, this.editor.figureManager);
}
