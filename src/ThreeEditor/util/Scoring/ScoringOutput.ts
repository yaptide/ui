import { Editor } from '../../js/Editor';
import { SimulationSceneGroup } from '../SimulationBase/SimulationGroup';
import { ScoringQuantity } from './ScoringQuantity';

export class ScoringOutput extends SimulationSceneGroup<ScoringQuantity> {
	readonly isOutput: true = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	constructor(editor: Editor) {
		super(editor, 'Outputs', 'ScoringGroup');
		this.children = [];
	}
}

export const isOutput = (x: any): x is ScoringOutput => x instanceof ScoringOutput;
