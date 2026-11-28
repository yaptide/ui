import { EditorJson } from '../../js/EditorJson';
import { CommonScoringOutputJSON } from './CommonScoringOutput';
import { SCORING_TYPE_ENUM } from './ScoringOutputTypes';

export function findScoringProblems(editorJson: EditorJson): string[] {
	const { detectorManager, zoneManager, scoringManager } = editorJson;
	const detectorUuids = new Set(detectorManager.detectors.map(detector => detector.uuid));
	const zoneUuids = new Set([
		zoneManager.worldZone.uuid,
		...zoneManager.zones.map(zone => zone.uuid)
	]);
	const filterUuids = new Set(scoringManager.filters.map(filter => filter.uuid));

	return scoringManager.outputs.flatMap(output => {
		const problems: string[] = [];
		const { scoringType, zoneUuid } = output as CommonScoringOutputJSON;

		if (scoringType === SCORING_TYPE_ENUM.ZONE) {
			if (!zoneUuid || !zoneUuids.has(zoneUuid))
				problems.push(`Output "${output.name}" has no zone selected.`);
		} else if (!output.detectorUuid || !detectorUuids.has(output.detectorUuid)) {
			problems.push(`Output "${output.name}" has no detector selected.`);
		}

		for (const quantity of output.quantities) {
			if ('filter' in quantity && !filterUuids.has(quantity.filter ?? ''))
				problems.push(
					`Quantity "${quantity.name}" in output "${output.name}" has Filter checked but no filter selected.`
				);
		}

		return problems;
	});
}
