import { EditorJson } from '../ThreeEditor/js/EditorJson';
import { CommonScoringOutputJSON } from '../ThreeEditor/Simulation/Scoring/CommonScoringOutput';
import { SCORING_TYPE_ENUM } from '../ThreeEditor/Simulation/Scoring/ScoringOutputTypes';
import { BooleanZoneJSON } from '../ThreeEditor/Simulation/Zones/BooleanZone';
import { SimulatorType } from '../types/RequestTypes';

const BLACK_HOLE_ICRU = 0;
const VACUUM_ICRU = 1000;
const SIZE_PARAMETERS = ['width', 'height', 'depth', 'radius'];

type OutputJSON = Pick<
	CommonScoringOutputJSON,
	'name' | 'quantities' | 'detectorUuid' | 'zoneUuid' | 'scoringType'
>;

type ZoneJSON = { name: string } & Partial<Pick<BooleanZoneJSON, 'unionOperations'>>;

function findGeometryReason(editorJson: EditorJson, simulator: SimulatorType): string | undefined {
	const { zoneManager, materialManager } = editorJson;

	if (simulator !== SimulatorType.SHIELDHIT && simulator !== SimulatorType.FLUKA)
		return undefined;

	const zones: ZoneJSON[] = zoneManager.zones;
	const zoneWithoutFigures = zones.find(zone => !zone.unionOperations?.flat().length);

	if (zoneWithoutFigures)
		return `Add a figure to zone "${zoneWithoutFigures.name}" in its Zone Operations`;

	if (
		simulator === SimulatorType.SHIELDHIT &&
		materialManager.materials.every(
			({ icru }) => icru === BLACK_HOLE_ICRU || icru === VACUUM_ICRU
		)
	)
		return 'SHIELD-HIT12A needs a material other than vacuum: add a zone or change the World Zone material';

	const worldZoneSize = Object.entries(zoneManager.worldZone.geometryData.parameters).filter(
		([key]) => SIZE_PARAMETERS.includes(key)
	);

	if (worldZoneSize.some(([, value]) => !(Number(value) > 0)))
		return zones.length === 0
			? 'Set the World Zone size: enter its dimensions'
			: 'Set the World Zone size: enter its dimensions or use Calculate to fit it to the zones';

	return undefined;
}

function findScoringReason(editorJson: EditorJson): string | undefined {
	const { scoringManager, detectorManager, zoneManager } = editorJson;
	const outputs: OutputJSON[] = scoringManager.outputs;

	if (outputs.length === 0) return 'Add an output with a quantity in the Scoring tab';

	const outputWithoutQuantities = outputs.find(output => output.quantities.length === 0);

	if (outputWithoutQuantities)
		return `Add a quantity to output "${outputWithoutQuantities.name}" or remove the output`;

	const detectorUuids = new Set(detectorManager.detectors.map(detector => detector.uuid));
	const zoneUuids = new Set(zoneManager.zones.map(zone => zone.uuid));

	for (const output of outputs) {
		if (output.scoringType === SCORING_TYPE_ENUM.ZONE) {
			if (!output.zoneUuid || !zoneUuids.has(output.zoneUuid))
				return `Select a zone for output "${output.name}"`;
		} else if (!output.detectorUuid || !detectorUuids.has(output.detectorUuid)) {
			return `Select a detector for output "${output.name}"`;
		}
	}

	return undefined;
}

export function findEmptyProjectReason(
	editorJson: EditorJson,
	simulator: SimulatorType
): string | undefined {
	const { figureManager, zoneManager, detectorManager, scoringManager } = editorJson;

	if (
		figureManager.figures.length === 0 &&
		zoneManager.zones.length === 0 &&
		detectorManager.detectors.length === 0 &&
		scoringManager.outputs.length === 0
	)
		return 'The project is empty: build the geometry in the Geometry tab and add an output with a quantity in the Scoring tab';

	return findGeometryReason(editorJson, simulator) ?? findScoringReason(editorJson);
}
