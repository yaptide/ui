import { PropertyManager } from '../util/Manager/PropertyManager';
import { Editor } from './Editor';

export type Simulator = 'shieldhit';
export type SimulationEnv = Simulator | 'custom';

export class SimulationEnvManager extends PropertyManager<SimulationEnv> {
	constructor(editor: Editor, value: SimulationEnv = 'shieldhit') {
		super(editor, value);
		this.addPropertyChangedListener(editor.signals.simulationEnvChanged.dispatch);
	}
}
