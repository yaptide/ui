import * as THREE from 'three';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader.js';

import { AddObjectCommand, SetSceneCommand } from './commands/Commands';
import { LoaderUtils } from './LoaderUtils.js';

/**
 * @deprecated Use DataLoaderService and YaptideEditor.handleJSON instead
 */
function Loader(editor) {
	const scope = this;

	this.texturePath = '';

	this.loadItemList = function (items) {
		LoaderUtils.getFilesFromItemList(items, function (files, filesMap) {
			scope.loadFiles(files, filesMap);
		});
	};

	this.loadFiles = function (files, currentFilesMap) {
		if (files.length > 0) {
			const filesMap = currentFilesMap || LoaderUtils.createFilesMap(files);

			const manager = new THREE.LoadingManager();
			manager.setURLModifier(function (url) {
				url = url.replace(/^(\.?\/)/, ''); // remove './'

				const file = filesMap[url];

				if (file) {
					console.log('Loading', url);

					return URL.createObjectURL(file);
				}

				return url;
			});

			manager.addHandler(/\.tga$/i, new TGALoader());

			for (let i = 0; i < files.length; i++) {
				scope.loadFile(files[i], manager);
			}
		}
	};

	this.loadFile = function (file, manager) {
		const filename = file.name;
		const extension = filename.split('.').pop().toLowerCase();

		const reader = new FileReader();
		reader.addEventListener('progress', event => {
			const size = '(' + Math.floor(event.total / 1000).format() + ' KB)';
			const progress = Math.floor((event.loaded / event.total) * 100) + '%';

			console.log('Loading', filename, size, progress);
		});

		switch (extension) {
			case 'js':
			case 'json':
				reader.addEventListener(
					'load',
					event => {
						const contents = event.target.result;

						// 2.0

						if (contents.indexOf('postMessage') !== -1) {
							const blob = new Blob([contents], { type: 'text/javascript' });
							const url = URL.createObjectURL(blob);

							const worker = new Worker(url);

							worker.onmessage = function (messageEvent) {
								messageEvent.data.metadata = { version: 2 };
								handleJSON(messageEvent.data);
							};

							worker.postMessage(Date.now());

							return;
						}

						// >= 3.0

						let data;

						try {
							data = JSON.parse(contents);
						} catch (error) {
							alert(error);

							return;
						}

						handleJSON(data);
					},
					false
				);
				reader.readAsText(file);

				break;

			default:
				console.error('Unsupported file format (' + extension + ').');

				break;
		}
	};

	this.loadJSON = function (json) {
		handleJSON(json);
	};

	function handleJSON(data) {
		if (data.metadata === undefined) {
			// 2.0

			data.metadata = { type: 'Geometry' };
		}

		if (data.metadata.type === undefined) {
			// 3.0

			data.metadata.type = 'Geometry';
		}

		if (data.metadata.formatVersion !== undefined) {
			data.metadata.version = data.metadata.formatVersion;
		}

		let loader;

		switch (data.metadata.type.toLowerCase()) {
			case 'buffergeometry':
				loader = new THREE.BufferGeometryLoader();
				let result = loader.parse(data);

				let mesh = new THREE.Mesh(result);

				editor.execute(new AddObjectCommand(editor, mesh));

				break;

			case 'geometry':
				console.error('Loader: "Geometry" is no longer supported.');

				break;

			case 'object':
				loader = new THREE.ObjectLoader();
				loader.setResourcePath(scope.texturePath);

				loader.parse(data, function (result) {
					if (result.isScene) {
						editor.execute(new SetSceneCommand(editor, result));
					} else {
						editor.execute(new AddObjectCommand(editor, result));
					}
				});

				break;

			case 'editor':
				let versionIsOk = true;

				if (data.metadata.version !== editor.jsonVersion) {
					versionIsOk = window.confirm(
						`File has  project standard version ${data.metadata.version} which is different from standard version handled by this web application: ${editor.jsonVersion}\nContinue?`
					);
				}

				if (
					versionIsOk &&
					window.confirm('Current editor data will be lost. Are you sure?')
				) {
					editor.clear();
					editor.fromSerialized(data);
				}

				break;

			default:
				console.error('Loader: ' + data.metadata.type.toLowerCase() + ' is not supported.');
		}
	}
}

export { Loader };
