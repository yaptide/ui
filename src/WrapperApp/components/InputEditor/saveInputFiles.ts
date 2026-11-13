import { format } from 'date-fns';
import { strToU8, zipSync } from 'fflate';

import { save, saveString } from '../../../util/File';
import { InputFiles, SimulatorDetection } from './simulatorDetection';

type SaveFilePickerWindow = Window & {
	showSaveFilePicker?: (options: { suggestedName: string }) => Promise<FileSystemFileHandle>;
};

export async function saveInputFile(name: string, content: string) {
	const pickerWindow = window as SaveFilePickerWindow;

	if (!pickerWindow.showSaveFilePicker) return saveString(content, name);

	try {
		const handle = await pickerWindow.showSaveFilePicker({ suggestedName: name });
		const writable = await handle.createWritable();
		await writable.write(content);
		await writable.close();
	} catch (error) {
		if (error instanceof DOMException && error.name === 'AbortError') return;

		saveString(content, name);
	}
}

export function inputFilesZipName(
	projectTitle: string | undefined,
	inputFiles: InputFiles,
	detection: SimulatorDetection | undefined
) {
	const simulators = Object.keys(inputFiles)
		.map(name => detection?.files[name]?.simulator)
		.filter((simulator, index, all) => simulator && all.indexOf(simulator) === index);
	const simulatorPart = simulators.length === 1 ? simulators[0] : 'input_files';
	const projectPart =
		(projectTitle ?? '')
			.normalize('NFC')
			.replace(new RegExp('[^\\p{L}\\p{N}_-]+', 'gu'), '_')
			.replace(/^_+|_+$/g, '') || 'project';

	return `${projectPart}_${simulatorPart}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.zip`;
}

export function saveInputFilesAsZip(inputFiles: InputFiles, zipName: string) {
	const zipped = zipSync(
		Object.fromEntries(
			Object.entries(inputFiles).map(([name, content]) => [name, strToU8(content)])
		)
	);

	save(new Blob([zipped as BlobPart], { type: 'application/zip' }), zipName);
}
