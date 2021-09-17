import * as THREE from 'three'

import Split from 'split-grid'

import { UIDiv, UIPanel } from './libs/ui.js';

import { VR } from './Viewport.VR.js';

import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Viewport } from './Viewport.js';

// Part of code from https://github.com/mrdoob/three.js/blob/r131/editor/js/Viewport.js, file was splitted to add multiple viewports

// spherical coordinates convention used in threejs can be found in source code of the Spherical class:
// https://github.com/mrdoob/three.js/blob/r132/src/math/Spherical.js
// it is assumed that polar (phi) and azimuthal/equator (theta) angles are calculated assuming:
//   - zenith direction being positive Y axis
//   - reference plane being XZ plane
// polar (phi) angle is being measured from fixed zenith direction (positive Y axis)
//   - point on positive part of Y axis: Y>0 X=Z=0  --> phi = 0
//   - point on XZ plane: Y=0, X=!0 or Z!=0         --> phi = pi/2 = 90*
//   - point on negative part of Y axis: Y<0 X=Z=0  --> phi = pi = 180*
// azimuthal (theta) angle is being measured starting at positive Z axis on reference plane,
// in principle theta = atan2(x,z)
//   - point on positive part of Z axis: Z>0 X=Y=0  --> theta = 0
//   - point on positive part of X axis: X>0 X=Z=0  --> theta = pi / 2 = 90*
//   - point on negative part of Z axis: Z<0 X=Y=0  --> theta = pi = 180 *
//   - point on positive part of X axis: X<0 X=Z=0  --> theta = -pi / 2 = -90* = 270*

// TODO - consider using converter Spherical.setFromCartesianCoords
//   then code reader would be free from understanding unusual convention of spherical coordinates system in threejs


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
	var zones = editor.zones;
	var sceneHelpers = editor.sceneHelpers;


	var objects = [];

	// helpers

	var grid = new THREE.Group();
	sceneHelpers.add(grid);

	var minorGrid = new THREE.GridHelper(30, 30, 0x888888);
	minorGrid.material.color.setHex(0x888888); // 0x888888 -> light grey (53% lightness)
	minorGrid.material.vertexColors = false;
	grid.add(minorGrid);

	var majorGrid = new THREE.GridHelper(30, 6, 0x222222);
	majorGrid.material.color.setHex(0x222222); // 0x222222 -> very dark grey (13% lightness)
	majorGrid.material.depthFunc = THREE.AlwaysDepth;
	majorGrid.material.vertexColors = false;
	grid.add(majorGrid);


	var planeHelpers = new THREE.Group();
	sceneHelpers.add(planeHelpers);


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
	viewsGrid.setBackgroundColor("#aaaaaa"); // aaaaaa -> dark grey (67% lightness)
	container.add(viewsGrid);

	let viewManagerProps = {
		objects,
		grid,
		planeHelpers,
		selectionBox
	}


	// Below we define configuration for 4 cameras
	// upper left : looking at plane XY
	// upper right : full 3D view
	// lower left : looking at plane

	// --------------- first view, upper left, XY plane ----------------------------------

	let configPlaneXY = {
		orthographic: true,

		// camera looking from above XY plane
		cameraPosition: new THREE.Vector3(0, 0, 10),

		// default clipping plane being XY plane (normal vector along Z axis)
		clipPlane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0.),

		planePosLabel: "PlanePos Z",

		// 0x73c5ff - Malibu color (light blue)
		planeHelperColor: 0x73c5ff,

		// by default grid plane lies within XZ plane
		// (phi = 90*, theta = any in threejs spherical coordinates, see comment in top part of this file)
		// to align it with desired XY plane we rotate the grid plane around X axis by 90*
		// therefore we use Euler angles (90*, 0*, 0*)
		gridRotation: new THREE.Euler(Math.PI / 2, 0, 0),
	};
	let viewPlaneXY = new Viewport("ViewPanelXY", editor, viewManagerProps, configPlaneXY);
	viewsGrid.add(viewPlaneXY.container);
	
	// fix the view to being from positive part of Z axis: theta = 0*, phi = 90*
	// for threejs spherical coordinates, see comment in top part of this file
	viewPlaneXY.controls.maxAzimuthAngle = viewPlaneXY.controls.minAzimuthAngle = 0;
	viewPlaneXY.controls.maxPolarAngle = viewPlaneXY.controls.minPolarAngle = Math.PI / 2;
	viewPlaneXY.controls.update();

	let gutterCol = new UIDiv().setClass("gutter-col gutter-col-1");
	viewsGrid.add(gutterCol);

	// --------------- second view, upper right, full 3D ----------------------------------

	let config3D = {
		showPlaneHelpers: true,

		// camera looking from the middle of X>0,Y>0,Z>0 quadrant
		cameraPosition: new THREE.Vector3(10, 10, 10),
	};
	let view3D = new Viewport("ViewPanel3D", editor, viewManagerProps, config3D);
	viewsGrid.add(view3D.container);

	// --------------- third view, lower left, XZ plane ----------------------------------

	// note we do not specify grid rotation here, as it was done in XY and YZ planes
	// by default grid plane lies within XZ plane which is consistent with current plane
	// (phi = 90*, theta = any in threejs spherical coordinates, see comment in top part of this file)
	let configPlaneXZ = {
		orthographic: true,

		// camera looking from above XZ plane
		cameraPosition: new THREE.Vector3(0, 10, 0),

		// default clipping plane being XZ plane (normal vector along Y axis)
		clipPlane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.),
		planePosLabel: "PlanePoz Y",

		// 0xc2ee00 - Lime color (between green and yellow)
		planeHelperColor: 0xc2ee00,
	};
	let viewPlaneXZ = new Viewport("ViewPanelY", editor, viewManagerProps, configPlaneXZ);
	viewsGrid.add(viewPlaneXZ.container);

	// fix the view to being from positive part of Y axis: theta = 0*, phi = 0*
	viewPlaneXZ.controls.maxAzimuthAngle = viewPlaneXZ.controls.minAzimuthAngle = 0;
	viewPlaneXZ.controls.maxPolarAngle = viewPlaneXZ.controls.minPolarAngle = 0;
	viewPlaneXZ.controls.update();

	let gutterRow = new UIDiv().setClass("gutter-row gutter-row-1");
	viewsGrid.add(gutterRow);

	// --------------- fourth view, lower right, YZ plane ----------------------------------

	let configPlaneYZ = {
		orthographic: true,

		// camera looking from above YZ plane
		cameraPosition: new THREE.Vector3(10, 0, 0),

		// default clipping plane being YZ plane (normal vector along X axis)
		clipPlane: new THREE.Plane(new THREE.Vector3(1, 0, 0), 0.),
		planePosLabel: "PlanePos X",

		// 0xff7f9b - Tickle Me Pink color
		planeHelperColor: 0xff7f9b,

		// by default grid plane lies within XZ plane
		// (phi = 90*, theta = any in threejs spherical coordinates, see comment in top part of this file)
		// to align it with desired YZ plane we rotate the grid plane around Z axis by 90*
		// therefore we use Euler angles (0*, 0*, 90*)
		gridRotation: new THREE.Euler(0, 0, Math.PI / 2),
	};
	let viewPlaneYZ = new Viewport("ViewPanelX", editor, viewManagerProps, configPlaneYZ);
	viewsGrid.add(viewPlaneYZ.container);

	// fix the view to being from positive part of X axis: theta = 90*, phi = 90*
	// see description of spherical coordinate system in threejs
	viewPlaneYZ.controls.maxAzimuthAngle = viewPlaneYZ.controls.minAzimuthAngle = Math.PI / 2;
	viewPlaneYZ.controls.maxPolarAngle = viewPlaneYZ.controls.minPolarAngle = Math.PI / 2;
	viewPlaneYZ.controls.update();


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

	let fourViews = [viewPlaneXY, view3D, viewPlaneXZ, viewPlaneYZ];

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

	setLayout(editor.layout ?? "fourViews");


	// events

	function updateAspectRatio() {

		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();

	}


	// signals

	signals.editorCleared.add(function () {

		views.forEach((view) => view.controls.center && view.controls.center.set(0, 0, 0));
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
				updateGridColors(minorGrid, majorGrid, event.matches ? [0x222222, 0x888888] : [0x888888, 0x282828]);

				render();

			});

			renderer.setClearColor(mediaQuery.matches ? 0x333333 : 0xaaaaaa);
			updateGridColors(minorGrid, majorGrid, mediaQuery.matches ? [0x222222, 0x888888] : [0x888888, 0x282828]);

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


		if (object !== null && object !== scene && object !== camera && object !== zones) {

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

			default:

				console.error(backgroundType, "isn't supported");
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

			default:

				console.error(environmentType, "isn't supported");
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
			default:
				console.error(fogType, "isn't supported");
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
			default:
				console.error(fogType, "isn't supported");
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

	function setLayout(layout) {
		currentLayout = layout;
		editor.layout = layout;

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
	}

	signals.layoutChanged.add(function (layout, quiet) {
		setLayout(layout);
		quiet || signals.layoutSaved.dispatch();
	});

	// viewport config

	signals.viewportConfigChanged.add(function () {

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
