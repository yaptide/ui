/**
 * Distributes total number of primaries across workerCount workers as evenly as possible.
 * The remainder is distributed across the first remainder workers.
 *
 * Example: 10 primaries across 3 workers -> [4, 3, 3]
 */
export function distributePrimaries(totalPrimaries: number, workerCount: number): number[] {
	if (workerCount <= 0) {
		return [];
	}

	if (totalPrimaries <= 0) {
		return new Array(workerCount).fill(0);
	}

	const count = Math.min(workerCount, totalPrimaries);
	const base = Math.floor(totalPrimaries / count);
	const remainder = totalPrimaries % count;

	const result = new Array(count).fill(base).map((val, idx) => (idx < remainder ? val + 1 : val));

	// If there are more workers requested than total primaries, pad the rest with 0
	while (result.length < workerCount) {
		result.push(0);
	}

	return result;
}

/**
 * Generates a valid pair of positive 32-bit seeds for Geant4 engine.
 */
export function generateRandomSeeds(): [number, number] {
	const buffer = new Uint32Array(2);

	if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
		crypto.getRandomValues(buffer);
	} else {
		buffer[0] = Math.floor(Math.random() * 2147483647);
		buffer[1] = Math.floor(Math.random() * 2147483647);
	}

	// Range (1 .. 2147483646) suitable for G4 engines
	const seed1 = (buffer[0] % 2147483646) + 1;
	const seed2 = (buffer[1] % 2147483646) + 1;

	return [seed1, seed2];
}

/**
 * Updates a base Geant4 macro file for a specific worker:
 * - Injects `/random/setSeeds <seed1> <seed2>`
 * - Updates `/run/beamOn <primaries>` with the worker's portion of primaries
 */
export function prepareWorkerMacro(
	macro: string,
	workerPrimaries: number,
	customSeeds?: [number, number]
): string {
	const [seed1, seed2] = customSeeds ?? generateRandomSeeds();
	const lines = macro.split('\n');

	let beamOnFound = false;
	const newLines: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();

		if (trimmed.startsWith('/run/beamOn')) {
			beamOnFound = true;
			newLines.push(`/random/setSeeds ${seed1} ${seed2}`);
			newLines.push(`/run/beamOn ${workerPrimaries}`);
		} else {
			newLines.push(line);
		}
	}

	// Fallback if macro didn't contain /run/beamOn
	if (!beamOnFound) {
		newLines.push(`/random/setSeeds ${seed1} ${seed2}`);
		newLines.push(`/run/beamOn ${workerPrimaries}`);
	}

	return newLines.join('\n');
}

/**
 * Merges output files produced by Geant4 primitive scorers from multiple workers.
 *
 * Each file format:
 * # mesh name: <meshName>
 * # primitive scorer name: <scorerName>
 * # iX, iY, iZ, total(value) [unit], total(val^2), entry
 * 0,0,0,12.5,156.25,4
 * ...
 *
 * For each coordinate cell (iX, iY, iZ), values in columns 3 (total value),
 * 4 (total val^2), and 5 (entries) are summed across all worker output files.
 */
export function mergeGeant4ResultFiles(fileContents: string[]): string {
	const validFiles = fileContents.filter(f => typeof f === 'string' && f.trim().length > 0);

	if (validFiles.length === 0) {
		return '';
	}

	if (validFiles.length === 1) {
		return validFiles[0];
	}

	// Split each file into lines
	const splitFiles = validFiles.map(content =>
		content
			.split('\n')
			.map(l => l.trim())
			.filter(l => l.length > 0)
	);

	// The first 3 lines are the header comments
	const headerLines = splitFiles[0].slice(0, 3);
	const rowCount = splitFiles[0].length;

	// Parse lines across all files
	const mergedLines: string[] = [...headerLines];

	for (let lineIdx = 3; lineIdx < rowCount; lineIdx++) {
		const baseLine = splitFiles[0][lineIdx];
		const baseParts = baseLine.split(',');

		// Columns 0, 1, 2 are coordinates (e.g. iX, iY, iZ or iZ, iPHI, iR)
		const coords = baseParts.slice(0, 3).join(',');

		let sumValue = 0;
		let sumValSq = 0;
		let sumEntries = 0;

		for (let fileIdx = 0; fileIdx < splitFiles.length; fileIdx++) {
			const currentLine = splitFiles[fileIdx][lineIdx];

			if (!currentLine) continue;

			const parts = currentLine.split(',');

			if (parts.length >= 6) {
				sumValue += parseFloat(parts[3]) || 0;
				sumValSq += parseFloat(parts[4]) || 0;
				sumEntries += parseInt(parts[5], 10) || 0;
			} else if (parts.length >= 4) {
				// Fallback if only value column is present
				sumValue += parseFloat(parts[3]) || 0;
			}
		}

		if (baseParts.length >= 6) {
			mergedLines.push(`${coords},${sumValue},${sumValSq},${sumEntries}`);
		} else {
			mergedLines.push(`${coords},${sumValue}`);
		}
	}

	return mergedLines.join('\n') + '\n';
}
