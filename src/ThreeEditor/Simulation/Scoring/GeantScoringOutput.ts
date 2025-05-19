import { SerializableState } from '../../js/EditorJson';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationElementJSON } from '../Base/SimulationElement';
import { ScoringOutput } from './ScoringOutput';
import { ScoringQuantityJSON } from './ScoringQuantity';

export type GeantScoringOutputJSON = Omit<
	SimulationElementJSON & {
		quantities: ScoringQuantityJSON[];
		detectorUuid?: string;
		trace: boolean;
		traceFilter?: string;
	},
	never
>;

export class GeantScoringOutput
	extends ScoringOutput
	implements SerializableState<GeantScoringOutputJSON>
{
	static fromSerialized(editor: YaptideEditor, json: GeantScoringOutputJSON): GeantScoringOutput {
		return new GeantScoringOutput(editor).fromSerialized(json);
	}

	override duplicate(): GeantScoringOutput {
		const duplicated = new GeantScoringOutput(this.editor);

		duplicated.name = this.name;
		duplicated._trace = this._trace;

		duplicated.quantityContainer = this.quantityContainer.duplicate();
		duplicated.add(duplicated.quantityContainer);

		return duplicated;
	}
}
export const isGeantOutput = (x: unknown): x is GeantScoringOutput =>
	x instanceof GeantScoringOutput;
