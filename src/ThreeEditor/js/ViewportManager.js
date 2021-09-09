import * as THREE from 'three'

import Split from 'split-grid'

import { UIDiv, UIPanel } from './libs/ui.js';

import { VR } from './Viewport.VR.js';

import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Viewport } from './Viewport.js';



function ViewManager(editor) {

	var signals = editor.signals;

	var container = new UIPanel();
	container.setId('viewport');
	container.setPosition('absolute');


	//

	var renderer = null;
	var pmremGenerator = null;

	var camera = editor.camera;
	var scene = editor.scene;
	var sceneHelpers = editor.sceneHelpers;


	var objects = [];

	// helpers

	var grid = new THREE.Group();

	var grid1 = new THREE.GridHelper(30, 30, 0x888888);
	grid1.material.color.setHex(0x888888);
	grid1.material.vertexColors = false;
	grid.add(grid1);

	var grid2 = new THREE.GridHelper(30, 6, 0x222222);
	grid2.material.color.setHex(0x222222);
	grid2.material.depthFunc = THREE.AlwaysDepth;
	grid2.material.vertexColors = false;
	grid.add(grid2);


	var vr = new VR(editor);

	//

	var box = new THREE.Box3();

	var selectionBox = new THREE.BoxHelper();
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add(selectionBox);


	// Four Views Layout 

	let viewsGrid = new UIDiv();
	viewsGrid.setClass("grid");
	viewsGrid.setPosition("absolute");
	viewsGrid.setWidth("100%");
	viewsGrid.setHeight("100%");
	viewsGrid.setBackgroundColor("#aaaaaa");
	container.add(viewsGrid);

	let viewManagerProps = {
		objects,
		grid,
		selectionBox
	}

	let viewZ = new Viewport("ViewPanel1", editor, viewManagerProps, true, new THREE.Vector3(0, 0, 10));
	viewsGrid.add(viewZ.container);

	let gutterCol = new UIDiv().setClass("gutter-col gutter-col-1");
	viewsGrid.add(gutterCol);

	let view3D = new Viewport("ViewPanel2", editor, viewManagerProps);
	viewsGrid.add(view3D.container);

	let viewY = new Viewport("ViewPanel3", editor, viewManagerProps, true, new THREE.Vector3(0, 10, 0));
	viewsGrid.add(viewY.container);

	let gutterRow = new UIDiv().setClass("gutter-row gutter-row-1");
	viewsGrid.add(gutterRow);

	let viewX = new Viewport("ViewPanel4", editor, viewManagerProps, true, new THREE.Vector3(10, 0, 0));
	viewsGrid.add(viewX.container);

	// Add resizable views

	Split({
		columnGutters: [{
			track: 1,
			element: gutterCol.dom,
		}],
		rowGutters: [{
			track: 1,
			element: gutterRow.dom,
		}],
		onDragEnd: (direction, track) => {
			views.forEach((view) => view.setSize());

			render();
		}
	});

	let fourViews = [viewZ, view3D, viewY, viewX];

	// Single View Layout 

	let viewSingle = new UIDiv();
	viewSingle.setPosition("absolute");
	viewSingle.setWidth("100%");
	viewSingle.setHeight("100%");
	viewSingle.setBackgroundColor("#aaaaaa");
	container.add(viewSingle);

	let viewport = new Viewport("ViewPanel", editor, viewManagerProps);
	viewport.container.setPosition("absolute");
	viewport.container.setWidth("100%");
	viewport.container.setHeight("100%");
	viewSingle.add(viewport.container);

	let singleView = [viewport];

	let currentLayout = 'singleView';

	let views = singleView;

	views.forEach((view) => view.config.visible = true);


	// events

	function updateAspectRatio() {

		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();

	}


	// signals

	signals.editorCleared.add(function () {

		views.forEach((view) => view.controls.center.set(0, 0, 0));
		render();

	});

	signals.rendererUpdated.add(function () {

		scene.traverse(function (child) {

			if (child.material !== undefined) {

				child.material.needsUpdate = true;

			}

		});

		render();

	});

	signals.rendererCreated.add(function (newRenderer) {

		if (renderer !== null) {

			renderer.setAnimationLoop(null);
			renderer.dispose();
			pmremGenerator.dispose();

			container.dom.removeChild(renderer.domElement);

		}

		renderer = newRenderer;

		renderer.setAnimationLoop(animate);
		renderer.setClearColor(0xaaaaaa);

		if (window.matchMedia) {

			var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			mediaQuery.addListener(function (event) {

				renderer.setClearColor(event.matches ? 0x333333 : 0xaaaaaa);
				updateGridColors(grid1, grid2, event.matches ? [0x222222, 0x888888] : [0x888888, 0x282828]);

				render();

			});

			renderer.setClearColor(mediaQuery.matches ? 0x333333 : 0xaaaaaa);
			updateGridColors(grid1, grid2, mediaQuery.matches ? [0x222222, 0x888888] : [0x888888, 0x282828]);

		}

		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);

		pmremGenerator = new THREE.PMREMGenerator(renderer);
		pmremGenerator.compileEquirectangularShader();

		container.dom.appendChild(renderer.domElement);

		render();

	});

	signals.sceneGraphChanged.add(function () {

		render();

	});

	signals.cameraChanged.add(function () {

		render();

	});

	signals.objectSelected.add(function (object) {

		selectionBox.visible = false;


		if (object !== null && object !== scene && object !== camera) {

			box.setFromObject(object);

			if (box.isEmpty() === false) {

				selectionBox.setFromObject(object);
				selectionBox.visible = true;

			}

		}

		render();

	});

	signals.objectFocused.add(function (object) {

		views.forEach((view) => view.controls.focus(object));

	});

	signals.geometryChanged.add(function (object) {

		if (object !== undefined) {

			selectionBox.setFromObject(object);

		}

		render();

	});

	signals.objectAdded.add(function (object) {

		object.traverse(function (child) {

			objects.push(child);

		});

	});

	signals.objectChanged.add(function (object) {

		if (editor.selected === object) {

			selectionBox.setFromObject(object);

		}

		if (object.isPerspectiveCamera) {

			object.updateProjectionMatrix();

		}

		if (editor.helpers[object.id] !== undefined) {

			editor.helpers[object.id].update();

		}

		render();

	});

	signals.objectRemoved.add(function (object) {

		object.traverse(function (child) {

			objects.splice(objects.indexOf(child), 1);

		});

	});

	signals.helperAdded.add(function (object) {

		var picker = object.getObjectByName('picker');

		if (picker !== undefined) {

			objects.push(picker);

		}

	});

	signals.helperRemoved.add(function (object) {

		var picker = object.getObjectByName('picker');

		if (picker !== undefined) {

			objects.splice(objects.indexOf(picker), 1);

		}

	});

	signals.materialChanged.add(function () {

		render();

	});

	signals.animationStopped.add(function () {

		render();

	});

	// background

	signals.sceneBackgroundChanged.add(function (backgroundType, backgroundColor, backgroundTexture, backgroundEquirectangularTexture) {

		switch (backgroundType) {

			case 'None':

				scene.background = null;

				break;

			case 'Color':

				scene.background = new THREE.Color(backgroundColor);

				break;

			case 'Texture':

				if (backgroundTexture) {

					scene.background = backgroundTexture;

				}

				break;

			case 'Equirectangular':

				if (backgroundEquirectangularTexture) {

					backgroundEquirectangularTexture.mapping = THREE.EquirectangularReflectionMapping;
					scene.background = backgroundEquirectangularTexture;

				}

				break;

		}

		render();

	});

	// environment

	signals.sceneEnvironmentChanged.add(function (environmentType, environmentEquirectangularTexture) {

		switch (environmentType) {

			case 'None':

				scene.environment = null;

				break;

			case 'Equirectangular':

				scene.environment = null;

				if (environmentEquirectangularTexture) {

					environmentEquirectangularTexture.mapping = THREE.EquirectangularReflectionMapping;
					scene.environment = environmentEquirectangularTexture;

				}

				break;

			case 'ModelViewer':

				scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

				break;

		}

		render();

	});

	// fog

	signals.sceneFogChanged.add(function (fogType, fogColor, fogNear, fogFar, fogDensity) {

		switch (fogType) {

			case 'None':
				scene.fog = null;
				break;
			case 'Fog':
				scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
				break;
			case 'FogExp2':
				scene.fog = new THREE.FogExp2(fogColor, fogDensity);
				break;

		}

		render();

	});

	signals.sceneFogSettingsChanged.add(function (fogType, fogColor, fogNear, fogFar, fogDensity) {

		switch (fogType) {

			case 'Fog':
				scene.fog.color.setHex(fogColor);
				scene.fog.near = fogNear;
				scene.fog.far = fogFar;
				break;
			case 'FogExp2':
				scene.fog.color.setHex(fogColor);
				scene.fog.density = fogDensity;
				break;

		}

		render();

	});

	signals.viewportCameraChanged.add(function () {

		var viewportCamera = editor.viewportCamera;

		if (viewportCamera.isPerspectiveCamera) {

			viewportCamera.aspect = editor.camera.aspect;
			viewportCamera.projectionMatrix.copy(editor.camera.projectionMatrix);

		} else if (viewportCamera.isOrthographicCamera) {

			// TODO

		}

		// disable EditorControls when setting a user camera

		// controls.enabled = (viewportCamera === editor.camera);
		// views.forEach((view)=>view.controls.enabled = true);

		render();

	});

	signals.exitedVR.add(render);

	//

	signals.windowResize.add(function () {

		views.forEach((view) => view.setSize());

		render();

	});

	signals.showGridChanged.add(function (showGrid) {

		grid.visible = showGrid;
		render();

	});


	signals.cameraResetted.add(updateAspectRatio);

	// Layout 

	editor.signals.layoutChanged.add(function (layout) {
		currentLayout = layout;

		viewsGrid.setDisplay('none');
		viewSingle.setDisplay('none');
		views.forEach((view) => view.config.visible = false);

		switch (layout) {

			case 'fourViews':
				views = fourViews;
				viewsGrid.dom.style.display = null;
				break;

			case 'singleView':
			default:
				currentLayout = 'singleView';
				views = singleView;
				viewSingle.dom.style.display = null;

		}

		views.forEach((view) => view.setSize());
		views.forEach((view) => view.config.visible = true);

		render();

	});


	// animations

	var clock = new THREE.Clock(); // only used for animations

	function animate() {

		var mixer = editor.mixer;
		var delta = clock.getDelta();

		var needsUpdate = false;

		if (mixer.stats.actions.inUse > 0) {

			mixer.update(delta);
			needsUpdate = true;

		}

		needsUpdate = views.map((view) => view.animate(delta)).some(e => e);


		if (vr.currentSession !== null) {

			needsUpdate = true;

		}


		if (needsUpdate === true) render();

	}

	//

	var startTime = 0;
	var endTime = 0;

	function render() {

		startTime = performance.now();

		views.forEach((view) => view.render(renderer));

		endTime = performance.now();
		editor.signals.sceneRendered.dispatch(endTime - startTime);

	}

	return container;

}

function updateGridColors(grid1, grid2, colors) {

	grid1.material.color.setHex(colors[0]);
	grid2.material.color.setHex(colors[1]);

}

export { ViewManager };
