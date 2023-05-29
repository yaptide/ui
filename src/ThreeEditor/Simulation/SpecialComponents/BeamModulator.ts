import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationZone } from '../Base/SimZone';

export class BeamModulator extends SimulationZone {
	readonly isBeamModulator: true = true;
	constructor(editor: YaptideEditor) {
		super(editor, 'Beam Modulator', 'BeamModulator');
	}
}

export function isBeamModulator(object: unknown): object is BeamModulator {
	return object instanceof BeamModulator;
}
