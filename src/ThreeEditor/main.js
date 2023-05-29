import * as THREE from 'three';
import { YaptideEditor } from './js/Editor.js';
import { SidebarProjectRenderer } from './js/sidebar/Sidebar.Project.Renderer.js';
import { ViewManager } from './js/viewport/ViewportManager.js';

export function initEditor(container) {
	container = container || document.body;

	window.URL = window.URL || window.webkitURL;
	window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

	// eslint-disable-next-line no-extend-native
	Number.prototype.format = function () {
		return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
	};

	const editor = new YaptideEditor(container);

	window.editor = editor; // Expose editor to Console
	window.THREE = THREE; // Expose THREE to APP Scripts and Console

	const viewManager = new ViewManager(editor);
	container.appendChild(viewManager.container.dom);

	editor.viewManager = viewManager;

	// SidebarProjectRenderer has createRenderer function that is required for editor to work
	new SidebarProjectRenderer(editor);
	//

	editor.storage.init(() => {
		const { signals } = editor;

		editor.storage.get(state => {
			if (isLoadingFromHash) return;

			if (typeof state !== 'undefined') {
				let versionIsOk = true;
				if (state.metadata.version !== editor.jsonVersion) {
					versionIsOk = window.confirm(
						`Editor in memory has version of JSON: ${state.metadata.version}\nCurrent version of editor JSON: ${editor.jsonVersion}\nLoad it anyway?`
					);
				}

				if (versionIsOk) editor.fromJSON(state);
			}

			const selected = editor.config.getKey('selected');

			if (typeof selected !== 'undefined') {
				editor.selectByUuid(selected);
			}
		});

		//

		let timeout;

		function saveState() {
			if (editor.config.getKey('autosave') === false) {
				return;
			}

			clearTimeout(timeout);

			timeout = setTimeout(() => {
				editor.signals.savingStarted.dispatch();

				timeout = setTimeout(() => {
					editor.storage.set(editor.toJSON());

					editor.signals.savingFinished.dispatch();
				}, 100);
			}, 1000);
		}

		const stateChangedSignals = [
			signals.geometryChanged,
			signals.objectAdded,
			signals.objectChanged,
			signals.objectRemoved,
			signals.materialChanged,
			signals.sceneBackgroundChanged,
			signals.sceneEnvironmentChanged,
			signals.sceneGraphChanged,
			signals.historyChanged,
			signals.detectFilterChanged,
			signals.scoringQuantityChanged,
			signals.projectChanged
		];
		stateChangedSignals.forEach(signal => signal.add(saveState));
	});

	editor.signals.sceneGraphChanged.dispatch();

	//

	document.addEventListener(
		'dragover',
		event => {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';
		},
		false
	);

	document.addEventListener(
		'drop',
		event => {
			event.preventDefault();

			if (event.dataTransfer.types[0] === 'text/plain') return; // Outliner drop

			if (event.dataTransfer.items) {
				// DataTransferItemList supports folders

				editor.loader.loadItemList(event.dataTransfer.items);
			} else {
				editor.loader.loadFiles(event.dataTransfer.files);
			}
		},
		false
	);

	function onWindowResize() {
		editor.signals.windowResize.dispatch();
	}

	window.addEventListener('resize', onWindowResize, false);

	onWindowResize();

	//

	let isLoadingFromHash = false;
	const hash = window.location.hash;

	if (hash.substr(1, 5) === 'file=') {
		const file = hash.substr(6);

		if (window.confirm('Any unsaved data will be lost. Are you sure?')) {
			var loader = new THREE.FileLoader();
			loader.crossOrigin = '';
			loader.load(file, text => {
				editor.clear();
				editor.fromJSON(JSON.parse(text));
			});

			isLoadingFromHash = true;
		}
	}

	return { editor, viewport: viewManager };
}
