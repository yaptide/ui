import { Signal } from 'signals';
import { Editor } from '../../js/Editor';
import { SimulationSceneContainer } from '../Base/SimulationScene';
import { ScoringOutput, ScoringOutputJSON } from './ScoringOutput';
import { UniqueChildrenNames } from '../../../util/Name/Name';

export type ScoringManagerJSON = {
	uuid: string;
	name: string;
	scoringOutputs: ScoringOutputJSON[];
};
export class ScoringManager
	extends SimulationSceneContainer<ScoringOutput>
	implements UniqueChildrenNames
{
	readonly isScoringManager: true = true;
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly notHidable = true;
	private signals: {
		objectAdded: Signal<THREE.Object3D>;
		objectRemoved: Signal<THREE.Object3D>;
	};
	constructor(editor: Editor) {
		super(editor, 'Outputs', 'OutputGroup');
		this.children = [];
		this.signals = editor.signals;
	}

	addOutput(output: ScoringOutput) {
		this.add(output);

		this.signals.objectAdded.dispatch(output);
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
		return this.children.find(output => output.uuid === uuid);
	}
	getTakenDetectors(): string[] {
		return this.children
			.reduce<(string | null)[]>((acc, output) => {
				return acc.concat(output.getTakenDetector());
			}, [])
			.filter(Boolean);
	}
	toJSON(): ScoringManagerJSON {
		return {
			uuid: this.uuid,
			name: this.name,
			scoringOutputs: this.children.map(output => output.toJSON())
		};
	}
	fromJSON(json: ScoringManagerJSON): this {
		this.uuid = json.uuid;
		this.name = json.name;
		json.scoringOutputs.forEach(output => {
			const scoringOutput = new ScoringOutput(this.editor);
			this.addOutput(scoringOutput);
			scoringOutput.fromJSON(output);
			scoringOutput.name = this.getNextFreeName(scoringOutput);
		});
		return this;
	}
	static fromJSON(editor: Editor, json: ScoringManagerJSON) {
		return new ScoringManager(editor).fromJSON(json);
	}
	reset(): void {
		this.name = 'Outputs';
		return super.reset();
	}
}

export const isScoringManager = (x: unknown): x is ScoringManager => x instanceof ScoringManager;
