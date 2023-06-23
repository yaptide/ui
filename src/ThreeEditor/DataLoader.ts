import { hasPath } from '../util/hasField';
import { YaptideEditor } from './js/YaptideEditor';

export class DataLoader {
	editor: YaptideEditor;
	constructor(editor: YaptideEditor) {
		this.editor = editor;
	}

	loadFile: (file: File) => void = (file: File) => {
		const filename = file.name;
		const extension = filename.split('.').pop()?.toLowerCase();
		const reader = new FileReader();
		reader.addEventListener('progress', event => {
			const size = `(${Math.floor(event.total / 1000)} KB)`;
			const progress = `${Math.floor((event.loaded / event.total) * 100)}%`;
			console.log('Loading', filename, size, progress);
		});

		switch (extension) {
			case 'json':
				reader.addEventListener('load', event => {
					const contents = event.target?.result as string | undefined;
					const json = contents && JSON.parse(contents);
					if (hasPath(json, 'metadata.type')) this.handleJSON(json);
				});
				break;
			default:
				console.log('Unknown file type', extension);
				return;
		}
	};

	loadFiles: (files: FileList) => void = (files: FileList) => {
		Array.from(files).forEach(this.loadFile);
	};

	handleJSON(json: { metadata: { type: unknown } }) {
		const type = json.metadata.type;
		switch (type) {
			case 'Editor':
				this.editor.fromJSON(json);
				break;
			default:
				console.log('Unknown JSON type', type);
				break;
		}
	}
}
