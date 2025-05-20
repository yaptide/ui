import { SerializableState } from '../../js/EditorJson';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationZone, SimulationZoneJSON } from '../Base/SimulationZone';
import * as GeantScoring from './GeantScoringOutputTypes';
import { ScoringFilter } from './ScoringFilter';

export type GeantQuantity1DHistogramDefinition = {
	nBins: number;
	low: number;
	high: number;
	unit: string;
	xAxisScale: (typeof GeantScoring.X_AXIS_SCALE_OPTS)[number];
	xAxisBinScheme: (typeof GeantScoring.X_AXIS_BIN_SCHEME_OPTS)[number];
};

export type GeantScoringQuantityJSON = Omit<
	SimulationZoneJSON & {
		quantityType: GeantScoring.SCORING_QUANTITY_TYPES;
		filter?: string;
		histogramDefinition: GeantQuantity1DHistogramDefinition;
	},
	never
>;

export class GeantScoringQuantity
	extends SimulationZone
	implements SerializableState<GeantScoringQuantityJSON>
{
	readonly isQuantity: true = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly notHidable = true;

	private _quantityType: GeantScoring.SCORING_QUANTITY_TYPES;
	private _filter: string;
	private _histogramDefinition: GeantQuantity1DHistogramDefinition;

	get quantityType(): GeantScoring.SCORING_QUANTITY_TYPES {
		return this._quantityType;
	}

	set quantityType(quantityType: GeantScoring.SCORING_QUANTITY_TYPES) {
		this._quantityType = quantityType;
	}

	get histogramNBins() {
		return this._histogramDefinition.nBins;
	}

	set histogramNBins(histogramNBins: number) {
		this._histogramDefinition.nBins = histogramNBins;
	}

	get histogramLow() {
		return this._histogramDefinition.low;
	}

	set histogramLow(low: number) {
		this._histogramDefinition.low = low;
	}

	get histogramHigh() {
		return this._histogramDefinition.high;
	}

	set histogramHigh(high: number) {
		this._histogramDefinition.high = high;
	}

	get histogramUnit() {
		return this._histogramDefinition.unit;
	}

	set histogramUnit(unit: string) {
		this._histogramDefinition.unit = unit;
	}

	get histogramXAxisScale() {
		return this._histogramDefinition.xAxisScale;
	}

	set histogramXAxisScale(scale: (typeof GeantScoring.X_AXIS_SCALE_OPTS)[number]) {
		this._histogramDefinition.xAxisScale = scale;
	}

	get histogramXAxisBinScheme() {
		return this._histogramDefinition.xAxisBinScheme;
	}

	set histogramXAxisBinScheme(scheme: (typeof GeantScoring.X_AXIS_BIN_SCHEME_OPTS)[number]) {
		this._histogramDefinition.xAxisBinScheme = scheme;
	}

	hasFilter: boolean;

	get filter(): ScoringFilter | null {
		if (!this.hasFilter) return null;

		return this.editor.scoringManager.getFilterByUuid(this._filter);
	}

	set filter(filter: ScoringFilter | null) {
		this._filter = filter?.uuid ?? '';
		this.hasFilter = !!this._filter.length;
	}

	constructor(editor: YaptideEditor) {
		super(editor, 'Quantity', 'Quantity');

		this._quantityType = GeantScoring.SCORING_QUANTITY_TYPES.doseDeposit;
		this.hasFilter = false;
		this._filter = '';
		this._histogramDefinition = {
			nBins: 10,
			low: 1,
			high: 10,
			unit: GeantScoring.SCORING_QUANTITY_UNITS[this.quantityType][0],
			xAxisScale: GeantScoring.X_AXIS_SCALE_OPTS[0],
			xAxisBinScheme: GeantScoring.X_AXIS_BIN_SCHEME_OPTS[0]
		};
	}

	toSerialized(): GeantScoringQuantityJSON {
		return {
			...super.toSerialized(),
			...(this.hasFilter && { filter: this.filter?.uuid }),
			quantityType: this.quantityType,
			histogramDefinition: this._histogramDefinition
		};
	}

	fromSerialized(json: GeantScoringQuantityJSON): this {
		super.fromSerialized(json);
		this._quantityType = json.quantityType;
		this.hasFilter = !!json.filter;
		this.filter = json.filter ? this.editor.scoringManager.getFilterByUuid(json.filter) : null;
		this._histogramDefinition = json.histogramDefinition;

		return this;
	}

	static fromSerialized(
		editor: YaptideEditor,
		json: GeantScoringQuantityJSON
	): GeantScoringQuantity {
		return new GeantScoringQuantity(editor).fromSerialized(json);
	}

	duplicate(): GeantScoringQuantity {
		const duplicated = new GeantScoringQuantity(this.editor);

		const generatedUuid = duplicated.uuid;
		duplicated.fromSerialized(this.toSerialized());
		duplicated.uuid = generatedUuid;

		return duplicated;
	}
}

export const isGeantScoringQuantity = (x: unknown): x is GeantScoringQuantity =>
	x instanceof GeantScoringQuantity;
