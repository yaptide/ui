import * as THREE from 'three';
import { Editor } from './js/Editor.js';
import { ViewManager } from './js/viewport/ViewportManager.js';
import { Toolbar } from './js/Toolbar.js';
import { Sidebar } from './js/sidebar/Sidebar.js';
import { Menubar } from './js/menubar/Menubar.js';
import { Resizer } from './js/Resizer.js';

export function initEditor(container) {
	container = container || document.body;

	window.URL = window.URL || window.webkitURL;
	window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

	Number.prototype.format = function () {
		return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
	};

	//

	var editor = new Editor(container);

	window.editor = editor; // Expose editor to Console
	window.THREE = THREE; // Expose THREE to APP Scripts and Console

	var viewManager = new ViewManager(editor);
	container.appendChild(viewManager.dom);

	var toolbar = new Toolbar(editor);
	container.appendChild(toolbar.dom);

	var sidebar = new Sidebar(editor);
	container.appendChild(sidebar.dom);

	var menubar = new Menubar(editor);
	container.appendChild(menubar.dom);

	var resizer = new Resizer(editor);
	container.appendChild(resizer.dom);

	//

	editor.storage.init(() => {
		const { signals } = editor;

		editor.storage.get(state => {
			if (isLoadingFromHash) return;

			if (typeof state !== 'undefined') {
				editor.fromJSON(state);
			}

			var selected = editor.config.getKey('selected');

			if (typeof selected !== 'undefined') {
				editor.selectByUuid(selected);
			}
		});

		//

		var timeout;

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

		signals.geometryChanged.add(saveState);
		signals.objectAdded.add(saveState);
		signals.objectChanged.add(saveState);
		signals.objectRemoved.add(saveState);
		signals.materialChanged.add(saveState);
		signals.sceneBackgroundChanged.add(saveState);
		signals.sceneEnvironmentChanged.add(saveState);
		signals.sceneGraphChanged.add(saveState);
		signals.scriptChanged.add(saveState);
		signals.historyChanged.add(saveState);

		//YAPTIDE signals
		signals.CSGManagerStateChanged.add(saveState);
	});

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

	var isLoadingFromHash = false;
	var hash = window.location.hash;

	if (hash.substr(1, 5) === 'file=') {
		var file = hash.substr(6);

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

	return { editor, viewport: viewManager, toolbar, sidebar, menubar, resizer };
}
