/**
 * The server refuses a simulation whose outputs would take more than this, in bytes.
 */
export const OUTPUTS_LIMIT_BYTES = 50e9;

type DetectorParameters = {
	xSegments?: number;
	ySegments?: number;
	zSegments?: number;
	radialSegments?: number;
};

type Project = {
	detectorManager: {
		detectors: {
			uuid: string;
			geometryData: { geometryType: string; parameters: DetectorParameters };
		}[];
	};
	scoringManager: {
		outputs: {
			name: string;
			detectorUuid?: string;
			quantities: { modifiers?: { binsNumber: number }[] }[];
		}[];
	};
};

/**
 * Bins per axis of a detector: a mesh's x, y and z segments, a cylinder's radial and z segments,
 * a single bin for a zone or the whole universe.
 */
function detectorBins({
	geometryType,
	parameters
}: Project['detectorManager']['detectors'][0]['geometryData']) {
	if (geometryType === 'Mesh')
		return [parameters.xSegments, parameters.ySegments, parameters.zSegments].map(n => n ?? 1);

	if (geometryType === 'Cyl') return [parameters.radialSegments ?? 1, parameters.zSegments ?? 1];

	return [1];
}

/**
 * Values a quantity scores in each bin: the bins of its differential scoring, of which SHIELD-HIT12A takes
 * the first two (Diff1, Diff2), 1 without it.
 */
const quantityValues = (quantity: Project['scoringManager']['outputs'][0]['quantities'][0]) =>
	(quantity.modifiers ?? [])
		.slice(0, 2)
		.reduce((values, modifier) => values * Math.max(Math.abs(modifier.binsNumber), 1), 1);

/**
 * The tasks the server runs: at least one, at most one per primary (as its get_clamped_ntasks_value).
 */
function clampedTasks(ntasks: number, primaries: number) {
	if (ntasks < 1) return 1;

	if (Number.isNaN(primaries)) return ntasks;

	return primaries < 1 ? 1 : Math.min(ntasks, primaries);
}

/**
 * Mirrors the server's estimate of the size of a SHIELD-HIT12A simulation's outputs: for each output the bins of its
 * detector times the values of each of its quantities, 8 bytes each, for every task it runs. Says why the server would
 * refuse it, naming the output with the most values, or undefined when it fits.
 */
export function outputsTooLarge(
	project: Project,
	requestedTasks: number,
	primaries: number
): string | undefined {
	const ntasks = clampedTasks(requestedTasks, primaries);
	const outputs = project.scoringManager.outputs.map(output => {
		const detector = project.detectorManager.detectors.find(
			d => d.uuid === output.detectorUuid
		);
		const bins = detector ? detectorBins(detector.geometryData) : [1];

		return {
			name: output.name,
			bins,
			values:
				bins.reduce((a, b) => a * b, 1) *
				output.quantities.reduce((sum, quantity) => sum + quantityValues(quantity), 0)
		};
	});
	const bytes = outputs.reduce((sum, output) => sum + output.values, 0) * 8 * ntasks;

	if (!(bytes > OUTPUTS_LIMIT_BYTES)) return undefined;

	const largest = outputs.reduce((a, b) => (b.values > a.values ? b : a));

	return (
		`The outputs would take ${Math.round(bytes / 1e9)} GB ` +
		`(${largest.name}: ${largest.bins.join(' × ')} bins × ${ntasks} tasks); ` +
		`the limit is ${OUTPUTS_LIMIT_BYTES / 1e9} GB. Use fewer bins or tasks.`
	);
}
