import { Signal } from 'signals';
import * as THREE from 'three';

import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneContainer } from '../Base/SimulationContainer';
import { SimulationElement, SimulationElementJSON } from '../Base/SimulationElement';
import { SimulationElementManager } from '../Base/SimulationManager';
import { SimulationZone } from '../Base/SimulationZone';
import { Detector } from '../Detectors/Detector';
import { ScoringFilter } from './ScoringFilter';
import { SCORING_TYPE_ENUM } from './ScoringOutputTypes';
import { ScoringQuantity, ScoringQuantityJSON } from './ScoringQuantity';

export type ScoringOutputJSON = Omit<
	SimulationElementJSON & {
		quantities: ScoringQuantityJSON[];
		detectorUuid?: string;
		zoneUuid?: string;
		scoringType?: string;
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

	duplicate() {
		const duplicated = new QuantityContainer(this.editor);

		this.children.forEach(child => duplicated.add(child.duplicate()));

		return duplicated;
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

	private signals: {
		objectSelected: Signal<THREE.Object3D>;
	};

	private _detector?: string;

	private _zone?: string;

	private _scoringType: SCORING_TYPE_ENUM = SCORING_TYPE_ENUM.DETECTOR;

	//TODO: Issue#320
	private _trace: [boolean, string | null];

	quantityContainer: QuantityContainer;
	geometry: THREE.BufferGeometry | null = null;

	get quantities() {
		return this.quantityContainer.children;
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
		return this._detector ?? null;
	}

	get detector(): Detector | null {
		if (!this._detector) return null;

		return this.editor.detectorManager.getDetectorByUuid(this._detector);
	}

	get zone(): SimulationZone | null {
		if (!this._zone) return null;

		return this.editor.zoneManager.getZoneByUuid(this._zone);
	}

	set detector(detector: Detector | null) {
		this._detector = detector?.uuid;
		this.geometry =
			detector?.geometry.clone().translate(...detector.position.toArray()) ?? null;
		this.signals.objectSelected.dispatch(this);
	}

	set zone(zone: SimulationZone | null) {
		this._zone = zone?.uuid;
		this.geometry = null;
		this.signals.objectSelected.dispatch(this);
	}

	get scoringType(): SCORING_TYPE_ENUM {
		return this._scoringType ?? SCORING_TYPE_ENUM.DETECTOR;
	}

	set scoringType(scoringType: SCORING_TYPE_ENUM) {
		this._scoringType = scoringType;

		if (scoringType === SCORING_TYPE_ENUM.DETECTOR) {
			this._zone = undefined;
		} else if (scoringType === SCORING_TYPE_ENUM.ZONE) {
			this._detector = undefined;
		}
	}

	constructor(editor: YaptideEditor) {
		super(editor, 'Output', 'Output');
		this.children = [];
		this.parent = null;
		this._trace = [false, ''];
		this.quantityContainer = new QuantityContainer(editor);
		this.add(this.quantityContainer);
		this.signals = editor.signals;
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

	/**
	 * @deprecated Use addQuantity instead
	 **/
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

	removeAllQuantities() {
		this.quantityContainer.clear();
	}

	toJSON(): ScoringOutputJSON {
		return {
			...super.toJSON(),
			quantities: this.quantityContainer.toJSON(),
			detectorUuid: this._detector,
			zoneUuid: this._zone,
			scoringType: this._scoringType,
			trace: this._trace[0],
			...(this.trace[1] && { traceFilter: this.trace[1] })
		};
	}

	fromJSON(json: ScoringOutputJSON): this {
		this.uuid = json.uuid;
		this.name = json.name;
		this._trace = [json.trace, json.traceFilter ?? null];
		this.quantityContainer.fromJSON(json.quantities);

		this.detector = json.detectorUuid
			? this.editor.detectorManager.getDetectorByUuid(json.detectorUuid)
			: null;
		this.zone = json.zoneUuid ? this.editor.zoneManager.getZoneByUuid(json.zoneUuid) : null;

		this._scoringType = (json.scoringType as SCORING_TYPE_ENUM) ?? SCORING_TYPE_ENUM.DETECTOR;

		return this;
	}

	static fromJSON(editor: YaptideEditor, json: ScoringOutputJSON): ScoringOutput {
		return new ScoringOutput(editor).fromJSON(json);
	}

	duplicate(): ScoringOutput {
		const duplicated = new ScoringOutput(this.editor);

		duplicated.name = this.name;
		duplicated._trace = this._trace;

		duplicated.quantityContainer = this.quantityContainer.duplicate();
		duplicated.add(duplicated.quantityContainer);

		duplicated._scoringType = this._scoringType ?? SCORING_TYPE_ENUM.DETECTOR;

		return duplicated;
	}
}

export const isOutput = (x: unknown): x is ScoringOutput => x instanceof ScoringOutput;

export const isQuantityContainer = (x: unknown): x is QuantityContainer =>
	x instanceof QuantityContainer;
