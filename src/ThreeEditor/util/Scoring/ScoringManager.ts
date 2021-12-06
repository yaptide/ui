import { Editor } from '../../js/Editor';
import { SimulationSceneGroup } from '../SimulationBase/SimulationGroup';
import { ScoringOutput } from './ScoringOutput';

export class ScoringManager extends SimulationSceneGroup<ScoringOutput> {
	readonly isScoringManager: true = true;
	readonly notRemovable = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	constructor(editor: Editor) {
		super(editor, 'Outputs', 'ScoringGroup');
		this.children = [];
	}
}
