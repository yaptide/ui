import { isCommonOutput } from './CommonScoringOutput';
import { isCustomFilter } from './CustomFilter';
import { isParticleFilter } from './ParticleFilter';
import { ScoringFilter } from './ScoringFilter';
import { SCORING_TYPE_ENUM } from './ScoringOutputTypes';

export function getScoringTypeLabel(object: unknown): string | undefined {
	if (isCommonOutput(object))
		return object.scoringType === SCORING_TYPE_ENUM.ZONE ? 'zone' : 'detector';

	if (isCustomFilter(object)) return 'custom';

	if (isParticleFilter(object)) return 'particle';

	return undefined;
}

function getFilterGroupLabel(filter: ScoringFilter): string | undefined {
	if (isCustomFilter(filter)) return 'Custom filters';

	if (isParticleFilter(filter)) return 'Particle filters';

	return undefined;
}

export function getFilterGroups(filters: ScoringFilter[]): Record<string, string> | undefined {
	const groups: Record<string, string> = {};

	for (const filter of filters) {
		const label = getFilterGroupLabel(filter);

		if (!label) return undefined;

		groups[filter.uuid] = label;
	}

	return groups;
}
