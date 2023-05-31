import { Signal } from 'signals';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneContainer } from '../Base/SimulationContainer';
import { SimulationElementManager } from '../Base/SimulationManager';
import { ScoringOutput, ScoringOutputJSON } from './ScoringOutput';
import { SimulationElement, SimulationElementJSON } from '../Base/SimulationElement';

export type ScoringManagerJSON = Omit<
	SimulationElementJSON & {
		scoringOutputs: ScoringOutputJSON[];
	},
	never
>;

export class OutputContainer extends SimulationSceneContainer<ScoringOutput> {
	children: ScoringOutput[];
	readonly isOutputContainer: true = true;
	constructor(editor: YaptideEditor) {
		super(editor, 'Outputs', 'OutputGroup', json => new ScoringOutput(editor).fromJSON(json));
		this.children = [];
	}

	reset() {
		this.name = 'Outputs';
		this.clear();
	}
}

export class ScoringManager
	extends SimulationElement
	implements SimulationElementManager<'output', ScoringOutput>
{
	readonly isScoringManager: true = true;
	private signals: {
		objectAdded: Signal<THREE.Object3D>;
		objectRemoved: Signal<THREE.Object3D>;
	};
	outputContainer: SimulationSceneContainer<ScoringOutput>;

	constructor(editor: YaptideEditor) {
		super(editor, 'Outputs', 'OutputGroup');
		this.children = [];
		this.signals = editor.signals;
		this.outputContainer = new OutputContainer(editor);
	}

	addOutput(output: ScoringOutput) {
		this.outputContainer.add(output);
		this.editor.select(output);
	}
	createOutput() {
		const output = new ScoringOutput(this.editor);
		output.createQuantity();
		this.addOutput(output);
		return output;
	}

	removeOutput(output: ScoringOutput) {
		this.remove(output);
		this.children.splice(this.children.indexOf(output), 1);
		output.parent = null;
		this.signals.objectRemoved.dispatch(output);
	}
	getOutputByUuid(uuid: string) {
		return this.outputContainer.children.find(output => output.uuid === uuid) ?? null;
	}
	getOutputByName(name: string) {
		return this.outputContainer.children.find(output => output.name === name) ?? null;
	}
	getTakenDetectors(): string[] {
		return this.outputContainer.children
			.reduce<(string | null)[]>((acc, output) => {
				return acc.concat(output.getTakenDetector());
			}, [])
			.filter(Boolean);
	}
	toJSON(): ScoringManagerJSON {
		return {
			...super.toJSON(),
			scoringOutputs: this.outputContainer.toJSON()
		};
	}
	fromJSON(json: ScoringManagerJSON): this {
		this.uuid = json.uuid;
		this.name = json.name;
		json.scoringOutputs.forEach(output => {
			const scoringOutput = new ScoringOutput(this.editor).fromJSON(output);
			this.addOutput(scoringOutput);
		});
		return this;
	}
	static fromJSON(editor: YaptideEditor, json: ScoringManagerJSON) {
		return new ScoringManager(editor).fromJSON(json);
	}

	reset(): void {
		this.name = 'Outputs';
		this.outputContainer.reset();
	}
}

export const isScoringManager = (x: unknown): x is ScoringManager => x instanceof ScoringManager;
