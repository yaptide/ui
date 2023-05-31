import { Signal } from 'signals';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneContainer } from '../Base/SimulationContainer';
import { SimulationElementManager } from '../Base/SimulationManager';
import { ScoringOutput, ScoringOutputJSON as OutputJSON } from './ScoringOutput';
import { SimulationElement, SimulationElementJSON } from '../Base/SimulationElement';
import { FilterJSON, ScoringFilter } from './ScoringFilter';

export type ScoringManagerJSON = Omit<
	SimulationElementJSON & {
		scoringOutputs: OutputJSON[];
		filters: FilterJSON[];
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
export class FilterContainer extends SimulationSceneContainer<ScoringFilter> {
	children: ScoringFilter[];
	readonly isFilterContainer: true = true;
	readonly flattenOnOutliner = true;
	constructor(editor: YaptideEditor) {
		super(editor, 'Filters', 'FilterGroup', json => new ScoringFilter(editor).fromJSON(json));
		this.children = [];
	}

	reset() {
		this.name = 'Filters';
		this.clear();
	}
}

export class ScoringManager
	extends SimulationElement
	implements
		SimulationElementManager<'output', ScoringOutput>,
		SimulationElementManager<'filter', ScoringFilter>
{
	readonly isScoringManager: true = true;
	private signals: {
		objectAdded: Signal<THREE.Object3D>;
		objectRemoved: Signal<THREE.Object3D>;
		detectFilterAdded: Signal<ScoringFilter>;
		detectFilterRemoved: Signal<ScoringFilter>;
	};
	outputContainer: SimulationSceneContainer<ScoringOutput>;
	filterContainer: SimulationSceneContainer<ScoringFilter>;

	constructor(editor: YaptideEditor) {
		super(editor, 'ScoringManager', 'OutputGroup');
		this.children = [];
		this.signals = editor.signals;
		this.outputContainer = new OutputContainer(editor);
		this.filterContainer = new FilterContainer(editor);
		this.add(this.outputContainer);
		this.add(this.filterContainer);
	}

	get outputs() {
		return this.outputContainer.children;
	}

	get filters() {
		return this.filterContainer.children;
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
		return this.outputs.find(output => output.uuid === uuid) ?? null;
	}
	getOutputByName(name: string) {
		return this.outputs.find(output => output.name === name) ?? null;
	}
	getTakenDetectors(): string[] {
		return this.outputs
			.reduce<(string | null)[]>((acc, output) => {
				return acc.concat(output.getTakenDetector());
			}, [])
			.filter(Boolean);
	}

	addFilter(filter: ScoringFilter): void {
		this.filterContainer.add(filter);
		this.editor.select(filter);
		this.signals.detectFilterAdded.dispatch(filter);
	}

	removeFilter(filter: ScoringFilter): void {
		this.filterContainer.remove(filter);
		this.editor.deselect();
		this.signals.detectFilterRemoved.dispatch(filter);
	}

	createFilter(): ScoringFilter {
		const filter = new ScoringFilter(this.editor);
		this.addFilter(filter);
		return filter;
	}

	getFilterByName(name: string) {
		return this.filters.find(filter => filter.name === name) ?? null;
	}

	getFilterByUuid(uuid: string) {
		return this.filters.find(filter => filter.uuid === uuid) ?? null;
	}

	getFilterOptions(): Record<string, string> {
		const options = this.filters
			.filter(filter => {
				return filter.rules.length;
			})
			.reduce((acc, filter) => {
				acc[filter.uuid] = `${filter.name} [${filter.id}]`;
				return acc;
			}, {} as Record<string, string>);
		return options;
	}

	toJSON(): ScoringManagerJSON {
		return {
			...super.toJSON(),
			scoringOutputs: this.outputContainer.toJSON(),
			filters: this.filterContainer.toJSON()
		};
	}
	fromJSON(json: ScoringManagerJSON): this {
		this.uuid = json.uuid;
		this.name = json.name;
		json.scoringOutputs.forEach(output => {
			const scoringOutput = new ScoringOutput(this.editor).fromJSON(output);
			this.addOutput(scoringOutput);
		});
		json.filters.forEach(filter => {
			const scoringFilter = new ScoringFilter(this.editor).fromJSON(filter);
			this.addFilter(scoringFilter);
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

export const isFilterContainer = (x: unknown): x is FilterContainer => x instanceof FilterContainer;
