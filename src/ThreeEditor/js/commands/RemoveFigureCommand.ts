import { RemoveObjectCommand } from './RemoveObjectCommand';

class RemoveFigureCommand extends RemoveObjectCommand {
	execute() {
		super.execute();
		this.editor.signals.figureRemoved.dispatch(this.object);
	}

	undo() {
		super.execute();
		this.editor.signals.figureAdded.dispatch(this.object);
	}
}

export { RemoveFigureCommand };
