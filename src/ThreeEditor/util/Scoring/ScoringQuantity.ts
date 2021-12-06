import { Editor } from '../../js/Editor';
import { SimulationSceneGroup } from '../SimulationBase/SimulationGroup';
import { ScoringQtyModifier } from './ScoringQtyModifiers';

export class ScoringQuantity extends SimulationSceneGroup<ScoringQtyModifier> {
	readonly isOutput: true = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	constructor(editor: Editor) {
		super(editor, 'Outputs', 'ScoringGroup');
		this.children = [];
	}
}

export const isOutput = (x: any): x is ScoringQuantity => x instanceof ScoringQuantity;
