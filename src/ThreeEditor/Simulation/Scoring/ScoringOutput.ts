import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneContainer } from '../Base/SimulationContainer';
import { SimulationElement, SimulationElementJSON } from '../Base/SimulationElement';
import { SimulationElementManager } from '../Base/SimulationManager';
import { Detector } from '../Detectors/Detector';
import { ScoringFilter } from './ScoringFilter';
import { ScoringQuantity, ScoringQuantityJSON } from './ScoringQuantity';

export type ScoringOutputJSON = Omit<
	SimulationElementJSON & {
		quantities: ScoringQuantityJSON[];
		detectGeometry?: string;
		primaries?: number;
		trace: boolean;
		traceFilter?: string;
	},
	never
>;

export class QuantityContainer extends SimulationSceneContainer<ScoringQuantity> {
	children: ScoringQuantity[];
	readonly isQuantityContainer: true = true;
	constructor(editor: YaptideEditor) {
		super(editor, 'Quantities', 'QuantityGroup', json =>
			new ScoringQuantity(editor).fromJSON(json)
		);
		this.children = [];
	}

	reset() {
		this.name = 'Quantities';
		this.clear();
	}
}

export class ScoringOutput
	extends SimulationElement
	implements SimulationElementManager<'quantity', ScoringQuantity, 'quantities'>
{
	readonly isOutput: true = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly notHidable = true;
	get notVisibleChildren(): boolean {
		return this._trace[0];
	}
	private _geometry?: string;
	private _primaries: [boolean, number | null];

	//TODO: Issue#320
	private _trace: [boolean, string | null];

	quantityContainer: SimulationSceneContainer<ScoringQuantity>;

	get quantities() {
		return this.quantityContainer.children;
	}

	get primaries(): [boolean, number | null] {
		return [this._primaries[0], this._primaries[0] ? this._primaries[1] : null];
	}

	set primaries(value: [boolean, number | null]) {
		this._primaries = [value[0], value[0] && value[1] !== null ? value[1] : this._primaries[1]];
	}

	get trace(): [boolean, string | null] {
		return [this._trace[0], this._trace[0] && this._trace[1] ? this._trace[1] : null];
	}

	set trace(filter: [boolean, string | null]) {
		this._trace = [filter[0], filter[0] && filter[1] ? filter[1] : this._trace[1]];
	}

	get traceFilter(): ScoringFilter | null {
		return this._trace[0] && this._trace[1]
			? this.editor.scoringManager.getFilterByUuid(this._trace[1])
			: null;
	}

	getTakenDetector(): string | null {
		return this._geometry ?? null;
	}

	get geometry(): Detector | null {
		if (!this._geometry) return null;
		return this.editor.detectorManager.getDetectorByUuid(this._geometry);
	}

	set geometry(geometry: Detector | null) {
		this._geometry = geometry?.uuid;
	}

	constructor(editor: YaptideEditor) {
		super(editor, 'Output', 'Output');
		this.children = [];
		this.parent = null;
		this._primaries = [false, 0];
		this._trace = [false, ''];
		this.quantityContainer = new QuantityContainer(editor);
		this.add(this.quantityContainer);
	}

	getQuantityByName(name: string) {
		return this.quantities.find(qty => qty.name === name) ?? null;
	}

	/**
	 * @deprecated Use getQuantityByUuid or getQuantityByName instead
	 */
	getObjectById(id: number) {
		return !this.notVisibleChildren ? this.children.find(qty => qty.id === id) : undefined;
	}

	createQuantity(): ScoringQuantity {
		const quantity = new ScoringQuantity(this.editor);
		this.addQuantity(quantity);
		return quantity;
	}

	addQuantity(quantity: ScoringQuantity) {
		this.quantityContainer.add(quantity);
		this.editor.select(quantity);
	}

	removeQuantity(quantity: ScoringQuantity) {
		this.quantityContainer.remove(quantity);
		this.editor.select(this);
	}

	getQuantityByUuid(uuid: string): ScoringQuantity | null {
		return this.quantities.find(qty => qty.uuid === uuid) ?? null;
	}

	toJSON(): ScoringOutputJSON {
		return {
			...super.toJSON(),
			quantities: this.quantityContainer.toJSON(),
			detectGeometry: this._geometry,
			trace: this._trace[0],
			...(this.primaries[1] && { primaries: this.primaries[1] }),
			...(this.trace[1] && { traceFilter: this.trace[1] })
		};
	}

	fromJSON(json: ScoringOutputJSON): this {
		this.uuid = json.uuid;
		this.name = json.name;
		this._primaries = [json.primaries !== undefined, json.primaries ?? null];
		this._trace = [json.trace, json.traceFilter ?? null];
		this.quantityContainer.fromJSON(json.quantities);
		this.geometry = json.detectGeometry
			? this.editor.detectorManager.getDetectorByUuid(json.detectGeometry)
			: null;
		return this;
	}

	static fromJSON(editor: YaptideEditor, json: ScoringOutputJSON): ScoringOutput {
		return new ScoringOutput(editor).fromJSON(json);
	}
}

export const isOutput = (x: unknown): x is ScoringOutput => x instanceof ScoringOutput;
