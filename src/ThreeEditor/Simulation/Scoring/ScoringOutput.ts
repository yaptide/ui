import { Editor } from '../../js/Editor';
import { SimulationSceneContainer } from '../Base/SimulationContainer';
import { DetectFilter } from './DetectFilter';
import { Detector } from '../Detectors/Detector';
import { ScoringQuantity, ScoringQuantityJSON } from './ScoringQuantity';
import { SimulationElementManager } from '../Base/SimulationManager';

export type ScoringOutputJSON = {
	uuid: string;
	name: string;
	quantities: { active: ScoringQuantityJSON[] };
	detectGeometry?: string;
	primaries?: number;
	trace: boolean;
	traceFilter?: string;
};
export class ScoringOutput
	extends SimulationSceneContainer<ScoringQuantity>
	implements SimulationElementManager<'quantity', ScoringQuantity>
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

	get traceFilter(): DetectFilter | null {
		return this._trace[0] && this._trace[1]
			? this.editor.detectorManager.getFilterByUuid(this._trace[1])
			: null;
	}

	getTakenDetector(): string | null {
		return this._geometry ?? null;
	}

	get geometry(): Detector | null {
		if (!this._geometry) return null;
		return this.editor.detectorManager.getGeometryByUuid(this._geometry);
	}

	set geometry(geometry: Detector | null) {
		this._geometry = geometry?.uuid;
	}

	constructor(editor: Editor) {
		super(editor, 'Output', 'Output');
		this.children = [];
		this.parent = null;
		this._primaries = [false, 0];
		this._trace = [false, ''];
		this.quantityContainer = this;
	}
	getQuantityByName(name: string) {
		return this.children.find(qty => qty.name === name) ?? null;
	}

	getObjectById(id: number) {
		return !this.notVisibleChildren ? this.children.find(qty => qty.id === id) : undefined;
	}

	createQuantity(): ScoringQuantity {
		const quantity = new ScoringQuantity(this.editor);
		this.addQuantity(quantity);
		return quantity;
	}

	addQuantity(quantity: ScoringQuantity) {
		this.add(quantity);
		this.editor.select(quantity);
	}

	removeQuantity(quantity: ScoringQuantity): this {
		this.children.splice(this.children.indexOf(quantity), 1);
		quantity.parent = null;
		this.editor.signals.objectRemoved.dispatch(quantity);
		return this;
	}

	getQuantityByUuid(uuid: string): ScoringQuantity | null {
		return this.children.find(qty => qty.uuid === uuid) || null;
	}

	toJSON(): ScoringOutputJSON {
		return {
			name: this.name,
			uuid: this.uuid,
			quantities: {
				active: [...this.children.map(qty => qty.toJSON())]
			},
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
		Object.values(json.quantities)
			.flat()
			.forEach(qty => this.addQuantity(ScoringQuantity.fromJSON(this.editor, qty)));
		this.geometry = json.detectGeometry
			? this.editor.detectorManager.getGeometryByUuid(json.detectGeometry)
			: null;
		return this;
	}

	static fromJSON(editor: Editor, json: ScoringOutputJSON): ScoringOutput {
		return new ScoringOutput(editor).fromJSON(json);
	}
}

export const isOutput = (x: unknown): x is ScoringOutput => x instanceof ScoringOutput;
