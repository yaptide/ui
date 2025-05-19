import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneContainer } from '../Base/SimulationContainer';
import { ScoringQuantity } from './ScoringQuantity';

export class QuantityContainer extends SimulationSceneContainer<ScoringQuantity> {
	children: ScoringQuantity[];
	readonly isQuantityContainer: true = true;
	constructor(editor: YaptideEditor) {
		super(editor, 'Quantities', 'QuantityGroup', json =>
			new ScoringQuantity(editor).fromSerialized(json)
		);
		this.children = [];
	}

	reset() {
		this.name = 'Quantities';
		this.clear();
	}

	duplicate() {
		const duplicated = new QuantityContainer(this.editor);

		this.children.forEach(child => duplicated.add(child.duplicate()));

		return duplicated;
	}
}

export const isQuantityContainer = (x: unknown): x is QuantityContainer =>
	x instanceof QuantityContainer;
