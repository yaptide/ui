import { Signal } from 'signals';

import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneContainer } from '../Base/SimulationContainer';
import { SimulationElement, SimulationElementJSON } from '../Base/SimulationElement';
import { SimulationElementManager } from '../Base/SimulationManager';
import { FilterJSON, ScoringFilter } from './ScoringFilter';
import { ScoringOutput, ScoringOutputJSON as OutputJSON } from './ScoringOutput';
import { ScoringQuantity } from './ScoringQuantity';

export type ScoringManagerJSON = Omit<
	SimulationElementJSON & {
		outputs: OutputJSON[];
		filters: FilterJSON[];
		metadata: Record<string, string | number>;
	},
	never
>;

const outputLoader = (editor: YaptideEditor) => (json: OutputJSON) =>
	new ScoringOutput(editor).fromJSON(json);

export class OutputContainer extends SimulationSceneContainer<ScoringOutput> {
	readonly isOutputContainer: true = true;
	constructor(editor: YaptideEditor) {
		super(editor, 'Outputs', 'OutputGroup', outputLoader(editor));
	}
}

const filterLoader = (editor: YaptideEditor) => (json: FilterJSON) =>
	new ScoringFilter(editor).fromJSON(json);

export class FilterContainer extends SimulationSceneContainer<ScoringFilter> {
	readonly isFilterContainer: true = true;
	constructor(editor: YaptideEditor) {
		super(editor, 'Filters', 'FilterGroup', filterLoader(editor));
	}
}

export class ScoringManager
	extends SimulationElement
	implements
		SimulationElementManager<'output', ScoringOutput>,
		SimulationElementManager<'filter', ScoringFilter>
{
	/****************************Private****************************/
	private readonly metadata = {
		version: `0.10`, //update this to current YaptideEditor version when format changes
		type: 'Manager',
		generator: 'ScoringManager.toJSON'
	} satisfies Record<string, string | number>;

	private signals: {
		objectAdded: Signal<THREE.Object3D>;
		objectRemoved: Signal<THREE.Object3D>;
		detectFilterAdded: Signal<ScoringFilter>;
		detectFilterRemoved: Signal<ScoringFilter>;
	};
	/***************************************************************/

	/*******************SimulationPropertiesType********************/
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly flattenOnOutliner = true;
	readonly isScoringManager: true = true;
	/***************************************************************/

	/*************************FilterMethods*************************/
	filterContainer: SimulationSceneContainer<ScoringFilter>;
	get filters() {
		return this.filterContainer.children;
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

	getFilterByUuid(uuid: string) {
		return this.filters.find(filter => filter.uuid === uuid) ?? null;
	}

	getFilterByName(name: string) {
		return this.filters.find(filter => filter.name === name) ?? null;
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
	/***************************************************************/

	/*************************OutputMethods*************************/
	outputContainer: SimulationSceneContainer<ScoringOutput>;
	get outputs() {
		return this.outputContainer.children;
	}

	addOutput(output: ScoringOutput) {
		this.outputContainer.add(output);
		output.addQuantity(new ScoringQuantity(this.editor));
		this.editor.select(output);
	}

	removeOutput(output: ScoringOutput) {
		this.outputContainer.remove(output);
		this.editor.deselect();
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
	/***************************************************************/

	constructor(editor: YaptideEditor) {
		super(editor, 'Scoring Manager', 'ScoringManager');

		this.children = [];

		this.outputContainer = new OutputContainer(editor);
		this.filterContainer = new FilterContainer(editor);

		this.add(this.outputContainer);
		this.add(this.filterContainer);

		this.signals = editor.signals;
	}

	copy(source: this, recursive?: boolean | undefined) {
		super.copy(source, recursive);

		return this.fromJSON(source.toJSON());
	}

	reset() {
		this.name = this._name;
		this.outputContainer.reset();
		this.filterContainer.reset();

		return this;
	}

	toJSON(): ScoringManagerJSON {
		const { metadata } = this;

		return {
			...super.toJSON(),
			outputs: this.outputContainer.toJSON(),
			filters: this.filterContainer.toJSON(),
			metadata
		};
	}

	fromJSON(json: ScoringManagerJSON) {
		const {
			metadata: { version }
		} = this;
		const { uuid, name, outputs, filters, metadata } = json;

		if (!metadata || metadata.version !== version)
			console.warn(`ScoringManager version mismatch: ${metadata?.version} !== ${version}`);

		this.uuid = uuid;
		this.name = name;
		this.filterContainer.fromJSON(filters);
		this.outputContainer.fromJSON(outputs);

		return this;
	}
}

export const isScoringManager = (x: unknown): x is ScoringManager => x instanceof ScoringManager;

export const isFilterContainer = (x: unknown): x is FilterContainer => x instanceof FilterContainer;
