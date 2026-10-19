/**
 * A page whose mesh was too large to show, sent averaged over blocks of bins: the bins per axis of the mesh and
 * of what is shown.
 */
export type Downsampled = { bins: number[]; shown: number[] };

/**
 * What a downsampled page tells the user, e.g. "Shown at 1000 × 1000 of 10000 × 10000 bins" (the axes of a single
 * bin left out); undefined for a page shown in full.
 */
export function downsampledLabel(downsampled?: Downsampled): string | undefined {
	if (!downsampled) return undefined;
	const axes = downsampled.bins.map((bins, i) => ({ bins, shown: downsampled.shown[i] }));
	const shownAxes = axes.filter(axis => axis.bins > 1);

	return `Shown at ${shownAxes.map(axis => axis.shown).join(' × ')} of ${shownAxes.map(axis => axis.bins).join(' × ')} bins`;
}
