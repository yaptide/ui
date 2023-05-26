import { Editor } from '../../js/Editor';
import { SimulationZone } from '../Base/SimZone';

export class BeamModulator extends SimulationZone {
	readonly isBeamModulator: true = true;
	constructor(editor: Editor) {
		super(editor, 'Beam Modulator', 'BeamModulator');
	}
}

export function isBeamModulator(object: unknown): object is BeamModulator {
	return object instanceof BeamModulator;
}
