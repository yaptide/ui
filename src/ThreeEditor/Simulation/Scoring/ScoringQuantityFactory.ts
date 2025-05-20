import { SimulatorType } from '../../../types/RequestTypes';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationZone, SimulationZoneJSON } from '../Base/SimulationZone';
import { GeantScoringQuantity, GeantScoringQuantityJSON } from './GeantScoringQuantity';
import { ScoringQuantity, ScoringQuantityJSON } from './ScoringQuantity';

// out of sight out of mind
export type IWannaBeQuantity = SimulationZone;
export type IWannaBeQuantityJSON = SimulationZoneJSON;

export default function createScoringQuantity(editor: YaptideEditor, json?: IWannaBeQuantityJSON) {
	if (editor.contextManager.currentSimulator === SimulatorType.GEANT4) {
		const quantity = new GeantScoringQuantity(editor);

		return json ? quantity.fromSerialized(json as GeantScoringQuantityJSON) : quantity;
	}

	const quantity = new ScoringQuantity(editor);

	return json ? quantity.fromSerialized(json as ScoringQuantityJSON) : quantity;
}
