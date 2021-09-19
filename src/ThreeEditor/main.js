import * as THREE from 'three';
import { Editor } from './js/Editor.js';
import { ViewManager } from './js/ViewportManager.js';
import { Toolbar } from './js/Toolbar.js';
import { Sidebar } from './js/Sidebar.js';
import { Menubar } from './js/Menubar.js';
import { Resizer } from './js/Resizer.js';


export function initEditor(container) {

    container = container || document.body;

    window.URL = window.URL || window.webkitURL;
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

    Number.prototype.format = function () { // eslint-disable-line

        return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

    };

    //

    var editor = new Editor();

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

    editor.storage.init(function () {

        var signals = editor.signals;

        editor.storage.get(function (state) {

            if (isLoadingFromHash) return;

            if (state !== undefined) {

                editor.fromJSON(state);

            }

            var selected = editor.config.getKey('selected');

            if (selected !== undefined) {

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

            timeout = setTimeout(function () {

                editor.signals.savingStarted.dispatch();

                timeout = setTimeout(function () {
                    
                    editor.storage.set( editor.toJSON() );

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
        signals.sceneFogChanged.add(saveState);
        signals.sceneGraphChanged.add(saveState);
        signals.scriptChanged.add(saveState);
        signals.historyChanged.add(saveState);
        signals.CSGManagerStateChanged.add(saveState);
        signals.layoutSaved.add(saveState);
    });

    //

    document.addEventListener('dragover', function (event) {

        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';

    }, false);

    document.addEventListener('drop', function (event) {

        event.preventDefault();

        if (event.dataTransfer.types[0] === 'text/plain') return; // Outliner drop

        if (event.dataTransfer.items) {

            // DataTransferItemList supports folders

            editor.loader.loadItemList(event.dataTransfer.items);

        } else {

            editor.loader.loadFiles(event.dataTransfer.files);

        }

    }, false);

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
            loader.load(file, function (text) {

                editor.clear();
                editor.fromJSON(JSON.parse(text));

            });

            isLoadingFromHash = true;

        }

    }

    return { editor, viewport: viewManager, toolbar, sidebar, menubar, resizer }
}

