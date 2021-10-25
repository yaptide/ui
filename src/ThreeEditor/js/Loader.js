import * as THREE from 'three';
import { AddObjectCommand, SetSceneCommand } from './commands/Commands';
import { LoaderUtils } from './LoaderUtils.js';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader.js';




function Loader(editor) {

	let scope = this;

	this.texturePath = '';

	this.loadItemList = function (items) {

		LoaderUtils.getFilesFromItemList(items, function (files, filesMap) {

			scope.loadFiles(files, filesMap);

		});

	};

	this.loadFiles = function (files, currentFilesMap) {

		if (files.length > 0) {

			let filesMap = currentFilesMap || LoaderUtils.createFilesMap(files);

			let manager = new THREE.LoadingManager();
			manager.setURLModifier(function (url) {

				url = url.replace(/^(\.?\/)/, ''); // remove './'

				let file = filesMap[url];

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

		let filename = file.name;
		let extension = filename.split('.').pop().toLowerCase();

		let reader = new FileReader();
		reader.addEventListener('progress', (event) => {

			let size = '(' + Math.floor(event.total / 1000).format() + ' KB)';
			let progress = Math.floor((event.loaded / event.total) * 100) + '%';

			console.log('Loading', filename, size, progress);

		});

		switch (extension) {
			case 'js':
			case 'json':

				reader.addEventListener('load', (event) => {

					let contents = event.target.result;

					// 2.0

					if (contents.indexOf('postMessage') !== - 1) {

						let blob = new Blob([contents], { type: 'text/javascript' });
						let url = URL.createObjectURL(blob);

						let worker = new Worker(url);

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

				}, false);
				reader.readAsText(file);

				break;

			default:

				console.error('Unsupported file format (' + extension + ').');

				break;

		}

	};

	function handleJSON(data) {

		if (data.metadata === undefined) { // 2.0

			data.metadata = { type: 'Geometry' };

		}

		if (data.metadata.type === undefined) { // 3.0

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

				if (window.confirm('Current editor data will be lost. Are you sure?')) {

					editor.clear();
					editor.fromJSON(data);

				}

				break;

			default:
				console.error('Loader: ' + data.metadata.type.toLowerCase() + ' is not supported.');

		}

	}

}

export { Loader };

