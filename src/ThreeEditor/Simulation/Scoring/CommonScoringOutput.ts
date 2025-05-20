import { SerializableState } from '../../js/EditorJson';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationElementJSON } from '../Base/SimulationElement';
import { SimulationZone } from '../Base/SimulationZone';
import { ScoringOutput } from './ScoringOutput';
import { SCORING_TYPE_ENUM } from './ScoringOutputTypes';
import { IWannaBeQuantityJSON } from './ScoringQuantityFactory';

export type CommonScoringOutputJSON = Omit<
	SimulationElementJSON & {
		quantities: IWannaBeQuantityJSON[];
		detectorUuid?: string;
		zoneUuid?: string;
		scoringType?: string;
		trace: boolean;
		traceFilter?: string;
	},
	never
>;

export class CommonScoringOutput
	extends ScoringOutput
	implements SerializableState<CommonScoringOutputJSON>
{
	private _zone?: string;

	private _scoringType: SCORING_TYPE_ENUM = SCORING_TYPE_ENUM.DETECTOR;

	get zone(): SimulationZone | null {
		if (!this._zone) return null;

		return this.editor.zoneManager.getZoneByUuid(this._zone);
	}

	set zone(zone: SimulationZone | null) {
		this._zone = zone?.uuid;
		this.geometry = null;
		this.signals.objectSelected.dispatch(this);
	}

	override get scoringType(): SCORING_TYPE_ENUM {
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

	override toSerialized(): CommonScoringOutputJSON {
		return {
			...super.toSerialized(),
			detectorUuid: this._detector,
			zoneUuid: this._zone,
			scoringType: this._scoringType
		};
	}

	override fromSerialized(json: CommonScoringOutputJSON): this {
		super.fromSerialized(json);

		this.detector = json.detectorUuid
			? this.editor.detectorManager.getDetectorByUuid(json.detectorUuid)
			: null;
		this.zone = json.zoneUuid ? this.editor.zoneManager.getZoneByUuid(json.zoneUuid) : null;

		this._scoringType = (json.scoringType as SCORING_TYPE_ENUM) ?? SCORING_TYPE_ENUM.DETECTOR;

		return this;
	}

	static fromSerialized(
		editor: YaptideEditor,
		json: CommonScoringOutputJSON
	): CommonScoringOutput {
		return new CommonScoringOutput(editor).fromSerialized(json);
	}

	duplicate(): CommonScoringOutput {
		const duplicated = new CommonScoringOutput(this.editor);

		duplicated.name = this.name;
		duplicated._trace = this._trace;

		duplicated.quantityContainer = this.quantityContainer.duplicate();
		duplicated.add(duplicated.quantityContainer);

		duplicated._scoringType = this._scoringType ?? SCORING_TYPE_ENUM.DETECTOR;

		return duplicated;
	}
}

export const isCommonOutput = (x: unknown): x is CommonScoringOutput =>
	x instanceof CommonScoringOutput;
