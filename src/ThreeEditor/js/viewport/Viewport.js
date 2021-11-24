import * as THREE from 'three';
import { SetPositionCommand, SetRotationCommand, SetScaleCommand } from '../commands/Commands';
import { ViewportClippedView as ViewportClipPlane } from './Viewport.ClipPlane';
import { EditorOrbitControls } from '../EditorOrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { UIPanel } from '../libs/ui';
import { ViewHelper } from './Viewport.ViewHelper';
import { ViewportCamera } from './Viewport.Camera.js';

// Part of code from https://github.com/mrdoob/three.js/blob/r131/editor/js/Viewport.js

export function Viewport(
	name,
	editor,
	{ objects, grid, planeHelpers, selectionBox },
	{
		orthographic,
		cameraPosition,
		cameraUp,
		clipPlane,
		planePosLabel,
		planeHelperColor,
		showPlaneHelpers,
		gridRotation
	} = {}
) {
	this.name = name;

	const { scene, zoneManager, detectManager, sceneHelpers, signals } = editor;

	const config = {
		showSceneHelpers: true,
		selectFigures: true,
		selectZones: false,
		selectSections: false,
		visible: false
	};

	const sceneViewHelpers = new THREE.Scene();

	const container = new UIPanel();
	container.setId('ViewPanel');
	container.setPosition('relative');
	container.setOverflow('hidden');
	container.dom.setAttribute('tabindex', '0');

	const canvas = document.createElement('canvas');
	container.dom.appendChild(canvas);

	const context = canvas.getContext('2d');

	const cameraPersp = new THREE.PerspectiveCamera(50, 1, 0.001, 10000);
	cameraPersp.name = 'Perspective';
	cameraPersp.position.copy(cameraPosition ?? new THREE.Vector3(0, 10, 10)); // default camera position other than (0,0,0) to see anything

	const cameraOrtho = new THREE.OrthographicCamera(1 / -2, 1 / 2, 1 / 2, 1 / -2, 0.001, 10000);
	cameraOrtho.name = 'Orthographic';
	cameraOrtho.position.copy(cameraPersp.position);
	cameraOrtho.zoom = 0.2;

	// in clipping plane views only Orthographic camera is used, hence is "up" axis adjustment is required we do so
	cameraUp && cameraOrtho.up.copy(cameraUp);

	const cameras = [cameraOrtho, cameraPersp];

	let camera = orthographic ? cameraOrtho : cameraPersp;
	updateAspectRatio();

	Object.defineProperty(this, 'camera', {
		get() {
			return camera;
		},
		set(value) {
			const position = camera.position.clone();

			camera = value;

			updateCamera(camera, position);
		}
	});

	if (!orthographic) container.add(new ViewportCamera(this, cameras));

	const viewHelper = new ViewHelper(camera, container);
	viewHelper.disabled = orthographic;

	let viewClipPlane = null;
	if (clipPlane) {
		viewClipPlane = new ViewportClipPlane(
			editor,
			this,
			planeHelpers,
			zoneManager.children,
			signals.zoneGeometryChanged,
			signals.zoneAdded,
			signals.zoneRemoved,
			{
				clipPlane,
				planeHelperColor,
				planePosLabel
			}
		);

		container.dom.appendChild(viewClipPlane.gui.domElement);
	}

	let cachedRenderer = null;

	function render(renderer = cachedRenderer) {
		if (!config.visible) return;

		cachedRenderer = renderer;

		if (!renderer) return;

		if (clipPlane) renderer.clippingPlanes = [clipPlane];

		// applying rotation to the grid plane, if not provided set default rotation to none
		// by default grid plane lies within XZ plane
		grid.rotation.copy(gridRotation ?? new THREE.Euler(0, 0, 0));

		renderer.setSize(canvas.width, canvas.height);

		renderer.render(scene, camera);

		renderer.autoClear = false;

		renderer.render(zoneManager, camera);

		renderer.render(detectManager, camera);

		if (clipPlane) renderer.render(viewClipPlane.scene, camera);

		renderer.clippingPlanes = []; // clear clipping planes for next renders

		if (config.showSceneHelpers) {
			planeHelpers.visible = showPlaneHelpers ?? false;

			renderer.render(sceneHelpers, camera);
			renderer.render(sceneViewHelpers, camera);
			viewHelper.render(renderer);
		}

		renderer.autoClear = true;

		context.drawImage(renderer.domElement, 0, 0);
	}

	function animate(delta) {
		if (!config.visible) return false;

		if (viewHelper.animating === true) {
			viewHelper.update(delta);

			return true;
		}

		return false;
	}

	// transform controls

	let objectPositionOnDown = null;
	let objectRotationOnDown = null;
	let objectScaleOnDown = null;

	const transformControls = new TransformControls(camera, container.dom);

	transformControls.addEventListener('change', () => {
		const object = transformControls.object;

		if (object !== undefined) {
			selectionBox.setFromObject(object);

			const helper = editor.helpers[object.id];

			if (helper !== undefined && helper.isSkeconstonHelper !== true) {
				helper.update();
			}

			signals.refreshSidebarObject3D.dispatch(object);
		}

		render();
	});

	transformControls.addEventListener('mouseDown', () => {
		const object = transformControls.object;

		objectPositionOnDown = object.position.clone();
		objectRotationOnDown = object.rotation.clone();
		objectScaleOnDown = object.scale.clone();

		controls.enabled = false;
	});

	transformControls.addEventListener('mouseUp', () => {
		const object = transformControls.object;

		if (object !== undefined) {
			switch (transformControls.getMode()) {
				case 'translate':
					if (!objectPositionOnDown.equals(object.position)) {
						editor.execute(
							new SetPositionCommand(
								editor,
								object,
								object.position,
								objectPositionOnDown
							)
						);
					}

					break;

				case 'rotate':
					if (!objectRotationOnDown.equals(object.rotation)) {
						editor.execute(
							new SetRotationCommand(
								editor,
								object,
								object.rotation,
								objectRotationOnDown
							)
						);
					}

					break;

				case 'scale':
					if (!objectScaleOnDown.equals(object.scale)) {
						editor.execute(
							new SetScaleCommand(editor, object, object.scale, objectScaleOnDown)
						);
					}

					break;

				default:
					console.error(transformControls.getMode());
			}
		}

		controls.enabled = true;
	});

	editor.container.addEventListener('keydown', event => {
		switch (event.key) {
			case 'Shift': // Shift
				transformControls.setTranslationSnap(1);
				transformControls.setRotationSnap(THREE.MathUtils.degToRad(15));
				break;

			default:
		}
	});

	editor.container.addEventListener('keyup', event => {
		switch (event.key) {
			case 'Shift': // Shift
				transformControls.setTranslationSnap(null);
				transformControls.setRotationSnap(null);
				break;

			default:
		}
	});

	sceneViewHelpers.add(transformControls);

	// object picking

	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();

	function getIntersects(point, validObjects) {
		mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);

		raycaster.setFromCamera(mouse, camera);

		return raycaster
			.intersectObjects(validObjects.getSelectable(config))
			.filter(intersect => intersect.object.visible === true);
	}

	const onDownPosition = new THREE.Vector2();
	const onUpPosition = new THREE.Vector2();
	const onDoubleClickPosition = new THREE.Vector2();

	function getMousePosition(dom, x, y) {
		const rect = dom.getBoundingClientRect();
		return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
	}

	// events

	function updateAspectRatio() {
		const aspect = container.dom.offsetWidth / container.dom.offsetHeight;

		cameraPersp.aspect = aspect;
		cameraPersp.updateProjectionMatrix();

		cameraOrtho.left = cameraOrtho.bottom * aspect;
		cameraOrtho.right = cameraOrtho.top * aspect;
		cameraOrtho.updateProjectionMatrix();
	}

	function handleClick() {
		if (onDownPosition.distanceTo(onUpPosition) === 0) {
			const intersects = getIntersects(onUpPosition, objects);

			if (intersects.length > 0) {
				const object = intersects[0].object;

				if (object.userData.object !== undefined) {
					// helper

					editor.select(object.userData.object);
				} else {
					editor.select(object);
				}

				transformControls.camera = camera;
			} else {
				editor.select(null);
			}

			render();
		}
	}

	function onMouseDown(event) {
		// event.preventDefault();
		const array = getMousePosition(container.dom, event.clientX, event.clientY);
		onDownPosition.fromArray(array);

		document.addEventListener('mouseup', onMouseUp, false);
	}

	function onMouseUp(event) {
		const array = getMousePosition(container.dom, event.clientX, event.clientY);
		onUpPosition.fromArray(array);

		handleClick();

		document.removeEventListener('mouseup', onMouseUp, false);
	}

	function onTouchStart(event) {
		const touch = event.changedTouches[0];

		const array = getMousePosition(container.dom, touch.clientX, touch.clientY);
		onDownPosition.fromArray(array);

		document.addEventListener('touchend', onTouchEnd, false);
	}

	function onTouchEnd(event) {
		const touch = event.changedTouches[0];

		const array = getMousePosition(container.dom, touch.clientX, touch.clientY);
		onUpPosition.fromArray(array);

		handleClick();

		document.removeEventListener('touchend', onTouchEnd, false);
	}

	function onDoubleClick(event) {
		const array = getMousePosition(container.dom, event.clientX, event.clientY);
		onDoubleClickPosition.fromArray(array);

		const intersects = getIntersects(onDoubleClickPosition, objects);

		if (intersects.length > 0) {
			const intersect = intersects[0];

			signals.objectFocused.dispatch(intersect.object);
		}
	}

	function canBeTransformed(object) {
		function notTransformable(object) {
			switch (transformControls.getMode()) {
				case 'translate':
					return object.notMovable;
				case 'rotate':
					return object.notRotatable;
				case 'scale':
					return object.notScalable;
				default:
					return false;
			}
		}
		// Check if object can be transformed.
		// For our usage it would be only geometries included on the scene.
		// Amount of geometries can differ form project to project thus we check only if it isn't mesh.
		// unionOperations is property unique to zones that shoudn't be transformed with controler.
		return object && !(object.isScene || object.isCamera || notTransformable(object));
	}

	function reattachTransformControls(object) {
		transformControls.detach();

		canBeTransformed(object) && transformControls.attach(object);
	}

	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.
	const controls = new EditorOrbitControls(camera, container.dom);
	controls.screenSpacePanning = false;
	controls.addEventListener('change', () => {
		signals.cameraChanged.dispatch(camera);
		signals.refreshSidebarObject3D.dispatch(camera);
	});
	viewHelper.controls = controls;

	function updateCamera(newCamera, position) {
		newCamera.position.copy(position);

		controls.object = newCamera;
		transformControls.camera = newCamera;
		viewHelper.editorCamera = newCamera;

		newCamera.lookAt(controls.target.x, controls.target.y, controls.target.z);
		updateAspectRatio();
	}

	container.dom.addEventListener('keydown', event => {
		switch (event.code) {
			case 'KeyC': // C
				const position = camera.position.clone();

				camera = camera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
				updateCamera(camera, position);
				render();

				break;

			case 'ControlLeft':
			case 'ControlRight':
				config.selectZones = true;
				config.selectFigures = false;
				break;

			default:
				break;
		}
	});
	container.dom.addEventListener('keyup', event => {
		switch (event.code) {
			case 'ControlLeft':
			case 'ControlRight':
				config.selectZones = false;
				config.selectFigures = true;
				break;

			default:
				break;
		}
	});

	container.dom.addEventListener('mousedown', onMouseDown, false);
	container.dom.addEventListener('touchstart', onTouchStart, false);
	container.dom.addEventListener('dblclick', onDoubleClick, false);

	signals.transformModeChanged.add(mode => {
		transformControls.setMode(mode);
		reattachTransformControls(editor.selected);
		render();
	});

	signals.snapChanged.add(dist => {
		transformControls.setTranslationSnap(dist);
	});

	signals.spaceChanged.add(space => {
		transformControls.setSpace(space);
	});

	signals.objectSelected.add(object => {
		reattachTransformControls(object);
		render();
	});

	signals.objectRemoved.add(object => {
		controls.enabled = true;

		if (object === transformControls.object) {
			transformControls.detach();
		}
	});

	signals.showHelpersChanged.add(showHelpers => {
		transformControls.enabled = showHelpers;

		render();
	});

	//YAPTIDE signals
	signals.objectChanged.add(() => {
		render();
	});


	this.setSize = (
		viewWidth = container.dom.offsetWidth,
		viewHeight = container.dom.offsetHeight
	) => {
		//prevent canvas from being empty
		canvas.width = Math.max(viewWidth, 2);
		canvas.height = Math.max(viewHeight, 2);
		updateAspectRatio();
	};

	this.reset = () => {
		controls.reset();
		viewClipPlane && viewClipPlane.reset();
	};

	this.setCameraFromUuid = uuid => {
		const newCam = cameras.find(e => e.uuid === uuid);
		if (newCam) this.camera = newCam;
		else console.error(`No camera with uuid: [${uuid}] in this viewport`);
	};

	return {
		...this,
		render,
		container,
		controls,
		viewHelper,
		animate,
		config
	};
}
