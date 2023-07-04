import Split from 'split-grid';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

import { UIDiv, UIPanel } from '../libs/ui.js';
import { Viewport } from './Viewport.js';

// Part of code from https://github.com/mrdoob/three.js/blob/r131/editor/js/Viewport.js, file was split to add multiple viewports

// spherical coordinates convention used in threejs can be found in source code of the Spherical class:
// https://github.com/mrdoob/three.js/blob/r132/src/math/Spherical.js
// first it is assumed that the default axis pointing upward ("up") is OY,
//  note that the "up" axis can be changed to either OX or OZ (i.e. using camera.up property)
//
// it is assumed that polar (phi) and azimuthal/equator (theta) angles are calculated assuming:
//   - zenith direction being positive Y axis
//   - reference plane being XZ plane
// polar (phi) angle is being measured from fixed zenith direction (positive Y axis)
//   - point on positive part of Y axis: Y>0 X=Z=0  			--> phi = 0
//   - point on XZ plane: 				 Y=0, X=!0 or Z!=0		 --> phi = pi/2 = 90*
//   - point on negative part of Y axis: Y<0 X=Z=0  			--> phi = pi = 180*
// azimuthal (theta) angle is being measured starting at positive Z axis on reference plane,
// in principle theta = atan2(x,z)
//   - point on positive part of Z axis: Z>0 X=Y=0  			--> theta = 0
//   - point on positive part of X axis: X>0 Y=Z=0  			--> theta = pi / 2 = 90*
//   - point on negative part of Z axis: Z<0 X=Y=0  			--> theta = pi = 180 *
//   - point on negative part of X axis: X<0 Y=Z=0  			--> theta = -pi / 2 = -90* = 270*

// TODO - consider using converter Spherical.setFromCartesianCoords
//   then code reader would be free from understanding unusual convention of spherical coordinates system in threejs

function ViewManager(editor) {
	const { camera, figureManager: scene, signals, sceneHelpers } = editor;

	const container = new UIPanel();
	container.setId('viewport');
	container.setPosition('absolute');

	//
	let currentLayout = editor.config.getKey('layout');

	let renderer = null;
	let pmremGenerator = null;

	// helpers

	const grid = new THREE.Group();
	sceneHelpers.add(grid);

	const minorGrid = new THREE.GridHelper(110, 110, 0x888888);
	minorGrid.material.color.setHex(0x888888); // 0x888888 -> light grey (53% lightness)
	minorGrid.material.vertexColors = false;
	grid.add(minorGrid);

	const majorGrid = new THREE.GridHelper(110, 11, 0x222222);
	majorGrid.material.color.setHex(0x222222); // 0x222222 -> very dark grey (13% lightness)
	majorGrid.material.depthFunc = THREE.AlwaysDepth;
	majorGrid.material.vertexColors = false;
	grid.add(majorGrid);

	const planeHelpers = new THREE.Group();
	sceneHelpers.add(planeHelpers);

	//

	const box = new THREE.Box3();

	const selectionBox = new THREE.BoxHelper();
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add(selectionBox);

	const viewportMap = {};

	// Four Views Layout

	const viewsGrid = new UIDiv();
	viewsGrid.setClass('grid');
	viewsGrid.setPosition('absolute');
	viewsGrid.setWidth('100%');
	viewsGrid.setHeight('100%');
	viewsGrid.setBackgroundColor('#aaaaaa'); // aaaaaa -> dark grey (67% lightness)
	container.add(viewsGrid);

	const viewManagerProps = {
		grid,
		planeHelpers,
		selectionBox
	};

	// Below we define configuration for 4 cameras
	// upper left : looking from the top at plane XY
	// upper right : full 3D view
	// lower left : looking from the top at plane XZ
	// lower right : looking from the top at plane YZ

	// each of the 2D planes is defined by clipping plane which removes from view (clip) a half-space
	// clipping removes points in space whose signed distance to the plane is negative
	// points with negative distance are located on the other side of the plane than the normal vector
	// therefore to remove from the view half-space Z>0 we define normal vector of XY plane to be [0,0,-1]
	// same convention is used for XZ an YZ planes to hide Y>0 and X>0 half-spaces from the view

	// in full 3D view user can choose between Perspective and Orthographic cameras
	// in 2D views the camera is fixed to be be Orthographic

	// --------------- first view, upper left, XY plane ----------------------------------

	const configPlaneXY = {
		orthographic: true,
		showPlaneHelpers: true,

		// camera looking from above XY plane
		cameraPosition: new THREE.Vector3(0, 0, 100),

		// default polar/theta rotation keep OY axis (default "up") parallel to the vertical axis of the screen
		// to avoid gimbal lock in XY plane view with correct orientation we select default "up" ax OZ
		cameraUp: new THREE.Vector3(0, 0, 1),

		// default clipping plane being XY plane (normal vector pointing down along Z axis)
		clipPlane: new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.0),

		planePosLabel: 'PlanePos Z',

		// 0x73c5ff - Malibu color (light blue)
		planeHelperColor: 0x73c5ff,

		// by default grid plane lies within XZ plane
		// (phi = 90*, theta = any in threejs spherical coordinates, see comment in top part of this file)
		// to align it with desired XY plane we rotate the grid plane around X axis by 90*
		// therefore we use Euler angles (90*, 0*, 0*)
		gridRotation: new THREE.Euler(Math.PI / 2, 0, 0)
	};
	const viewPlaneXY = new Viewport('ViewPanelXY', editor, viewManagerProps, configPlaneXY);
	viewportMap[viewPlaneXY.name] = viewPlaneXY;
	viewsGrid.add(viewPlaneXY.wrapperDiv);

	// fix the view to being from positive part of Z axis: phi = 0*, theta = 0*
	// for threejs spherical coordinates, see comment in top part of this file
	// here (up = "OZ", phi = 0, theta = 0) axis orientation is following:
	//    X pointing right
	//    Y pointing up
	//    Z pointing towards observer ("up")
	// azimuth angle control axis in the plane (here X,Z), polar angle control other axis
	viewPlaneXY.controls.maxPolarAngle = viewPlaneXY.controls.minPolarAngle = 0;
	viewPlaneXY.controls.maxAzimuthAngle = viewPlaneXY.controls.minAzimuthAngle = 0;
	viewPlaneXY.controls.update();

	const gutterCol = new UIDiv().setClass('gutter-col gutter-col-1');
	viewsGrid.add(gutterCol);

	// --------------- second view, upper right, full 3D ----------------------------------

	const config3D = {
		showPlaneHelpers: true,

		// camera looking from the middle of X>0,Y>0,Z>0 quadrant
		cameraPosition: new THREE.Vector3(10, 10, 10)
	};
	const view3D = new Viewport('ViewPanel3D', editor, viewManagerProps, config3D);
	viewportMap[view3D.name] = view3D;
	viewsGrid.add(view3D.wrapperDiv);

	// --------------- third view, lower left, XZ plane ----------------------------------

	// note we do not specify grid rotation here, as it was done in XY and YZ planes
	// by default grid plane lies within XZ plane which is consistent with current plane
	// (phi = 90*, theta = any in threejs spherical coordinates, see comment in top part of this file)
	const configPlaneXZ = {
		orthographic: true,
		showPlaneHelpers: true,

		// camera looking from above XZ plane
		cameraPosition: new THREE.Vector3(0, 100, 0),

		// default clipping plane being XZ plane (normal vector pointing down along Y axis)
		clipPlane: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.0),
		planePosLabel: 'PlanePoz Y',

		// 0xc2ee00 - Lime color (between green and yellow)
		planeHelperColor: 0xc2ee00
	};
	const viewPlaneXZ = new Viewport('ViewPanelY', editor, viewManagerProps, configPlaneXZ);
	viewportMap[viewPlaneXZ.name] = viewPlaneXZ;
	viewsGrid.add(viewPlaneXZ.wrapperDiv);

	// fix the view to being from positive part of Y axis: phi = 0*, theta = 270*
	// for threejs spherical coordinates, see comment in top part of this file
	// by default (up = "OY", phi = 0, theta = 0) axis orientation is following:
	//    X pointing right
	//    Y pointing towards observer ("up")
	//    Z pointing down
	// azimuth angle control axis in the plane (here X,Z), polar angle control other axis
	// by setting azimuth angle to 270* rotate X,Z axis, so now the axis orientation is
	//    X pointing up
	//    Y pointing towards observer ("up")
	//    Z pointing right
	viewPlaneXZ.controls.maxPolarAngle = viewPlaneXZ.controls.minPolarAngle = 0.0;
	viewPlaneXZ.controls.maxAzimuthAngle = viewPlaneXZ.controls.minAzimuthAngle =
		(3.0 * Math.PI) / 2.0;
	viewPlaneXZ.controls.update();

	const gutterRow = new UIDiv().setClass('gutter-row gutter-row-1');
	viewsGrid.add(gutterRow);

	// --------------- fourth view, lower right, YZ plane ----------------------------------

	const configPlaneYZ = {
		orthographic: true,
		showPlaneHelpers: true,

		// camera looking from above YZ plane
		cameraPosition: new THREE.Vector3(100, 0, 0),

		// default polar/theta rotation keep OY axis (default "up") parallel to the vertical axis of the screen
		// to achieve YZ plane view with correct orientation we select default "up" ax OX
		cameraUp: new THREE.Vector3(1, 0, 0),

		// default clipping plane being YZ plane (normal vector pointing down along X axis)
		clipPlane: new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.0),
		planePosLabel: 'PlanePos X',

		// 0xff7f9b - Tickle Me Pink color
		planeHelperColor: 0xff7f9b,

		// by default grid plane lies within XZ plane
		// (phi = 90*, theta = any in threejs spherical coordinates, see comment in top part of this file)
		// to align it with desired YZ plane we rotate the grid plane around Z axis by 90*
		// therefore we use Euler angles (0*, 0*, 90*)
		gridRotation: new THREE.Euler(0, 0, Math.PI / 2)
	};
	const viewPlaneYZ = new Viewport('ViewPanelX', editor, viewManagerProps, configPlaneYZ);
	viewportMap[viewPlaneYZ.name] = viewPlaneYZ;
	viewsGrid.add(viewPlaneYZ.wrapperDiv);

	// fix the view to being from positive part of X axis: phi = 0*, theta = 180*
	// for threejs spherical coordinates, see comment in top part of this file
	// here (up = "OX", phi = 0, theta = 0) axis orientation is following:
	//    X pointing towards observer ("up")
	//    Y pointing left
	//    Z pointing down
	// azimuth angle control axis in the plane (here Y,Z), polar angle control other axis
	// by setting azimuth angle to 180* rotate Y,Z axis, so now the axis orientation is
	//    X pointing towards observer ("up")
	//    Y pointing right
	//    Z pointing up
	viewPlaneYZ.controls.maxPolarAngle = viewPlaneYZ.controls.minPolarAngle = 0;
	viewPlaneYZ.controls.maxAzimuthAngle = viewPlaneYZ.controls.minAzimuthAngle = Math.PI;
	viewPlaneYZ.controls.update();

	// Add resizable views

	Split({
		columnGutters: [
			{
				track: 1,
				element: gutterCol.dom
			}
		],
		rowGutters: [
			{
				track: 1,
				element: gutterRow.dom
			}
		],
		onDragEnd: (direction, track) => {
			views.forEach(view => view.setSize());

			render();
		}
	});

	const fourViews = [viewPlaneXY, view3D, viewPlaneXZ, viewPlaneYZ];

	// Single View Layout

	const viewSingle = new UIDiv();
	viewSingle.setPosition('absolute');
	viewSingle.setWidth('100%');
	viewSingle.setHeight('100%');
	viewSingle.setBackgroundColor('#aaaaaa');
	container.add(viewSingle);

	const viewport = new Viewport('ViewPanel', editor, viewManagerProps);
	viewportMap[viewport.name] = viewport;
	viewport.container.setPosition('absolute');
	viewSingle.add(viewport.container);

	const singleView = [viewport];

	let views = singleView;

	views.forEach(view => (view.config.visible = true));

	setLayout(currentLayout ?? 'fourViews');

	// events

	function updateAspectRatio() {
		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();
	}

	// signals

	signals.editorCleared.add(() => {
		views.forEach(view => view.reset());
		render();
	});

	signals.rendererUpdated.add(() => {
		scene.traverse(function (child) {
			if (child.material !== undefined) {
				child.material.needsUpdate = true;
			}
		});

		render();
	});

	signals.rendererCreated.add(newRenderer => {
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
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			mediaQuery.addListener(function (event) {
				renderer.setClearColor(event.matches ? 0x333333 : 0xaaaaaa);
				updateGridColors(
					minorGrid,
					majorGrid,
					event.matches ? [0x222222, 0x888888] : [0x888888, 0x282828]
				);

				render();
			});

			renderer.setClearColor(mediaQuery.matches ? 0x333333 : 0xaaaaaa);
			updateGridColors(
				minorGrid,
				majorGrid,
				mediaQuery.matches ? [0x222222, 0x888888] : [0x888888, 0x282828]
			);
		}

		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);

		pmremGenerator = new THREE.PMREMGenerator(renderer);
		pmremGenerator.compileEquirectangularShader();

		container.dom.appendChild(renderer.domElement);

		render();
	});

	signals.sceneGraphChanged.add(() => {
		render();
	});

	signals.cameraChanged.add(() => {
		render();
	});

	const canBoxBeUpdated = object =>
		object &&
		!(
			object.isCamera ||
			object.isFilter ||
			object.isQuantity ||
			object.isScoringManager ||
			object.isOutput
		);

	const handleSelected = () => {
		const object = editor.selected;
		selectionBox.visible = false;

		if (canBoxBeUpdated(object) || (object?.isOutput && object?.detector?.isDetector)) {
			const selectionScope = object.isOutput ? object.detector : object;
			box.setFromObject(selectionScope);

			if (box.isEmpty() === false) {
				selectionBox.setFromObject(selectionScope);
				selectionBox.visible = true;
			}
		}

		render();
	};

	signals.objectSelected.add(handleSelected);
	signals.contextChanged.add(handleSelected);

	signals.objectFocused.add(object => {
		views.forEach(view => view.controls.focus(object));
	});

	signals.geometryChanged.add(object => {
		if (canBoxBeUpdated(object)) {
			selectionBox.setFromObject(object);
		} else if (object?.isOutput && object?.detector?.isDetector) {
			selectionBox.setFromObject(object.detector);
		}

		render();
	});

	signals.objectChanged.add(object => {
		if (editor.selected === object)
			if (canBoxBeUpdated(object)) {
				selectionBox.setFromObject(object);
			} else if (object?.isOutput && object?.detector?.isDetector) {
				selectionBox.setFromObject(object.detector);
			}

		if (object.isPerspectiveCamera) {
			object.updateProjectionMatrix();
		}

		if (editor.helpers[object.id] !== undefined) {
			editor.helpers[object.id].update();
		}

		render();
	});

	signals.materialChanged.add(() => {
		render();
	});

	// background

	signals.sceneBackgroundChanged.add(
		(backgroundType, backgroundColor, backgroundTexture, backgroundEquirectangularTexture) => {
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
						backgroundEquirectangularTexture.mapping =
							THREE.EquirectangularReflectionMapping;
						scene.background = backgroundEquirectangularTexture;
					}

					break;

				default:
					console.error(backgroundType, "isn't supported");

					break;
			}

			render();
		}
	);

	// environment

	signals.sceneEnvironmentChanged.add((environmentType, environmentEquirectangularTexture) => {
		switch (environmentType) {
			case 'None':
				scene.environment = null;

				break;

			case 'Equirectangular':
				scene.environment = null;

				if (environmentEquirectangularTexture) {
					environmentEquirectangularTexture.mapping =
						THREE.EquirectangularReflectionMapping;
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

	signals.viewportCameraChanged.add(() => {
		const { viewportCamera } = editor;

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

	//

	signals.windowResize.add(() => {
		views.forEach(view => view.setSize());

		render();
	});

	signals.showGridChanged.add(showGrid => {
		grid.visible = showGrid;
		render();
	});

	signals.cameraResetted.add(updateAspectRatio);

	// Layout

	function setLayout(layout) {
		viewsGrid.setDisplay('none');
		viewSingle.setDisplay('none');
		views.forEach(view => (view.config.visible = false));

		switch (layout) {
			case 'fourViews':
				currentLayout = 'fourViews';
				views = fourViews;
				viewsGrid.dom.style.display = null;

				break;

			case 'singleView':
			default:
				currentLayout = 'singleView';
				views = singleView;
				viewSingle.dom.style.display = null;
		}

		views.forEach(view => view.setSize());
		views.forEach(view => (view.config.visible = true));
		render();
	}

	signals.layoutChanged.add(layout => {
		setLayout(layout);
		editor.config.setKey('layout', currentLayout);
	});

	// viewport config

	signals.viewportConfigChanged.add(() => {
		render();
	});

	// animations

	const clock = new THREE.Clock(); // only used for animations

	function animate() {
		const { mixer } = editor;
		const delta = clock.getDelta();

		let needsUpdate = false;

		if (mixer.stats.actions.inUse > 0) {
			mixer.update(delta);
			needsUpdate = true;
		}

		needsUpdate = views.map(view => view.animate(delta)).some(e => e);

		if (needsUpdate === true) render();
	}

	//

	var startTime = 0;
	var endTime = 0;

	function render() {
		startTime = performance.now();

		views.forEach(view => view.render(renderer));

		endTime = performance.now();
		editor.signals.sceneRendered.dispatch(endTime - startTime);
	}

	this.configurationToJson = () => {
		const configJson = {};

		for (const key in viewportMap) {
			configJson[key] = viewportMap[key].configurationToJson();
		}

		return configJson;
	};

	this.fromConfigurationJson = configJson => {
		for (const key in configJson) {
			viewportMap[key].fromConfigurationJson(configJson[key]);
		}

		render();
	};

	return {
		...this,
		container
	};
}

function updateGridColors(grid1, grid2, colors) {
	grid1.material.color.setHex(colors[0]);
	grid2.material.color.setHex(colors[1]);
}

export { ViewManager };
