import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneContainer } from '../Base/SimulationContainer';
import { SimulationZone } from '../Base/SimulationZone';
import { ScoringQuantity } from './ScoringQuantity';
import createScoringQuantity from './ScoringQuantityFactory';

export class QuantityContainer extends SimulationSceneContainer<SimulationZone> {
	children: ScoringQuantity[];
	readonly isQuantityContainer: true = true;
	constructor(editor: YaptideEditor) {
		super(editor, 'Quantities', 'QuantityGroup', json => createScoringQuantity(editor, json));
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
