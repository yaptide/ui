import { Object3D } from 'three';

import { RemoveObjectCommand } from './RemoveObjectCommand';

class RemoveFigureCommand extends RemoveObjectCommand {
	execute() {
		super.execute();

		// Dispatch remove commands from bottom to top so each time the innermost object is called
		const dispatchRemove = (o: Object3D) => {
			if (o.children.length > 0) {
				for (const child of o.children) {
					dispatchRemove(child);
				}
			}

			this.editor.signals.figureRemoved.dispatch(o);
		};

		dispatchRemove(this.object);
	}

	undo() {
		super.undo();

		// Dispatch re-adding from top to bottom, so children are called after parent has been called
		const dispatchReAdd = (o: Object3D) => {
			this.editor.signals.figureAdded.dispatch(o);

			if (o.children.length > 0) {
				for (const child of o.children) {
					dispatchReAdd(child);
				}
			}
		};

		dispatchReAdd(this.object);
	}
}

export { RemoveFigureCommand };
