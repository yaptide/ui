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
		outputs: { name: string; detectorUuid?: string; quantities: unknown[] }[];
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
 * Mirrors the server's estimate of the size of a simulation's outputs: for each output the bins of its detector
 * times its quantities, 8 bytes each, for every task. Says why the server would refuse it, or undefined when it fits.
 */
export function outputsTooLarge(project: Project, ntasks: number): string | undefined {
	const outputs = project.scoringManager.outputs.map(output => {
		const detector = project.detectorManager.detectors.find(
			d => d.uuid === output.detectorUuid
		);
		const bins = detector ? detectorBins(detector.geometryData) : [1];

		return {
			name: output.name,
			bins,
			quantities: output.quantities.length,
			values: bins.reduce((a, b) => a * b, 1) * output.quantities.length
		};
	});
	const bytes = outputs.reduce((sum, output) => sum + output.values, 0) * 8 * ntasks;

	if (!(bytes > OUTPUTS_LIMIT_BYTES)) return undefined;

	const largest = outputs.reduce((a, b) => (b.values > a.values ? b : a));
	const quantities = largest.quantities > 1 ? ` × ${largest.quantities} quantities` : '';

	return (
		`The outputs would take ${Math.round(bytes / 1e9)} GB ` +
		`(${largest.name}: ${largest.bins.join(' × ')} bins${quantities} × ${ntasks} tasks); ` +
		`the limit is ${OUTPUTS_LIMIT_BYTES / 1e9} GB. Use fewer bins or tasks.`
	);
}
