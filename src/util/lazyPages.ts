import { PageDimension } from '../types/ResponseTypes';

/**
 * Pages up to these dimensions (0D and 1D: values and lines) load with their estimator; larger ones (2D maps, 3D
 * volumes) load only once the researcher scrolls to them, so looking at a depth-dose line does not download a heatmap.
 */
export const EAGER_DIMENSIONS = 1;

export type PageGroup = { dimension: number } & PageDimension;

/** The pages of an estimator, by their dimensions, from the lowest */
export function pageGroups(
	pagesByDimensions: Record<string, PageDimension> | undefined
): PageGroup[] {
	return Object.entries(pagesByDimensions ?? {})
		.map(([dimension, group]) => ({ dimension: Number(dimension), ...group }))
		.sort((a, b) => a.dimension - b.dimension);
}

/** The groups loaded with their estimator */
export const eagerGroups = (groups: PageGroup[]) =>
	groups.filter(group => group.dimension <= EAGER_DIMENSIONS);

/** The groups loaded when they come into view */
export const lazyGroups = (groups: PageGroup[]) =>
	groups.filter(group => group.dimension > EAGER_DIMENSIONS);
