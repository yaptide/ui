import { PropertyManager } from '../util/Manager/PropertyManager';
import { Editor } from './Editor';

const SIMULATION_ENVS = ['shieldhit', 'geant4', 'custom'] as const;
export type SimulationEnv = typeof SIMULATION_ENVS[number];
export type Simulator = Exclude<SimulationEnv, 'custom'>;

export class SimulationEnvManager extends PropertyManager<SimulationEnv> {
	constructor(editor: Editor, value: SimulationEnv = 'shieldhit') {
		super(editor, value);
		this.addPropertyChangedListener(editor.signals.simulationEnvChanged.dispatch);
	}
	toJSON(): { simulationEnviroment: SimulationEnv } {
		return { simulationEnviroment: this.currentValue };
	}
	fromJSON(json: { simulationEnviroment: SimulationEnv }): void {
		this.currentValue = json.simulationEnviroment;
	}
	getPossibleValues() {
		return SIMULATION_ENVS.reduce<Record<SimulationEnv, SimulationEnv>>((acc, curr) => {
			acc[curr] = curr;
			return acc;
		}, {} as Record<SimulationEnv, SimulationEnv>);
	}
}
