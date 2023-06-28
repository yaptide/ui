import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

import {
	SetPositionCommand,
	SetRotationCommand,
	SetScaleCommand,
	SetValueCommand
} from '../commands/Commands';
import { EditorOrbitControls } from '../EditorOrbitControls';
import { UIDiv, UIPanel } from '../libs/ui';
import { ViewportCamera } from './Viewport.Camera.js';
import { ViewportClippedViewCSG } from './Viewport.ClippedViewCSG';
import { ViewHelper } from './Viewport.ViewHelper';

// Part of code from https://github.com/mrdoob/three.js/blob/r131/editor/js/Viewport.js

const callWithHidden = (object, fn) => {
	if (!object) return fn();
	const visible = object.visible;

	object.visible = false;

	fn();

	object.visible = visible;
};

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
		showPlaneHelpers = false,
		gridRotation
	} = {}
) {
	this.name = name;

	const {
		figureManager: scene,
		zoneManager,
		detectorManager,
		sceneHelpers,
		specialComponentsManager,
		signals,
		contextManager
	} = editor;

	const config = {
		selectFigures: true,
		selectZones: false,
		selectGeometries: false,
		visible: false
	};

	const sceneViewHelpers = new THREE.Scene();

	const container = new UIPanel();
	container.setId('ViewPanel');
	container.setPosition('absolute');
	container.setOverflow('hidden');
	container.setWidth('100%');
	container.setHeight('100%');
	container.dom.setAttribute('tabindex', '0');

	const wrapperDiv = new UIDiv();
	wrapperDiv.setPosition('relative');
	wrapperDiv.add(container);

	const canvas = document.createElement('canvas');
	container.dom.appendChild(canvas);

	const context = canvas.getContext('2d');

	const cameraPersp = new THREE.PerspectiveCamera(50, 1, 0.001, 10000);
	cameraPersp.name = 'Perspective';
	cameraPersp.position.copy(cameraPosition ?? new THREE.Vector3(0, 20, 20)); // default camera position other than (0,0,0) to see anything

	const cameraOrtho = new THREE.OrthographicCamera(-4, 4, 4, -4, 0.001, 10000);
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
		viewClipPlane = new ViewportClippedViewCSG(
			name,
			editor,
			this,
			planeHelpers,
			zoneManager.zoneContainer.children,
			signals.zoneGeometryChanged,
			signals.zoneAdded,
			signals.zoneRemoved,
			wrapperDiv.dom,
			{
				clipPlane,
				planeHelperColor,
				planePosLabel
			}
		);
	}

	let cachedRenderer = null;

	function render(renderer = cachedRenderer) {
		if (!config.visible) return;

		cachedRenderer = renderer;

		if (!renderer) return;

		// applying rotation to the grid plane, if not provided set default rotation to none
		// by default grid plane lies within XZ plane
		grid.rotation.copy(gridRotation ?? new THREE.Euler(0, 0, 0));

		renderer.setSize(canvas.width, canvas.height);

		renderer.autoClear = false;

		renderer.clear();

		if (clipPlane) renderer.render(viewClipPlane.scene, camera);
		else {
			renderer.render(detectorManager, camera);

			renderer.render(scene, camera);

			renderer.render(specialComponentsManager, camera);

			renderer.render(zoneManager, camera);
		}

		planeHelpers.visible = showPlaneHelpers;

		callWithHidden(viewClipPlane?.planeHelper, () => {
			renderer.render(sceneHelpers, camera);
		});

		renderer.render(sceneViewHelpers, camera);

		viewHelper.render(renderer);

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
						if (object.isWorldZone)
							editor.execute(
								new SetValueCommand(editor, object, 'center', object.position)
							);
						else
							editor.execute(new SetPositionCommand(editor, object, object.position));
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

	function getIntersects(point) {
		mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);
		const clicableObjects = contextManager.getClickableObjects();

		raycaster.setFromCamera(mouse, camera);

		return raycaster
			.intersectObjects(clicableObjects)
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
			const intersects = getIntersects(onUpPosition);

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

		const intersects = getIntersects(onDoubleClickPosition);

		if (intersects.length > 0) {
			const intersect = intersects[0];

			signals.objectFocused.dispatch(intersect.object);
		}
	}

	function canBeTransformed(object) {
		function notTransformable(o) {
			switch (transformControls.getMode()) {
				case 'translate':
					return o.notMovable;
				case 'rotate':
					return o.notRotatable;
				case 'scale':
					return o.notScalable;
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

			default:
				break;
		}
	});

	container.dom.addEventListener('mousedown', onMouseDown);
	container.dom.addEventListener('touchstart', onTouchStart);
	container.dom.addEventListener('dblclick', onDoubleClick);

	signals.transformModeChanged.add(mode => {
		transformControls.setMode(mode);
		reattachTransformControls(editor.selected);
		render();
	});

	signals.snapChanged.add(transformControls.setTranslationSnap);

	signals.spaceChanged.add(transformControls.setSpace);

	signals.objectSelected.add(reattachTransformControls);
	signals.autocalculateChanged.add(() => reattachTransformControls(editor.selected));
	signals.detectGeometryChanged.add(reattachTransformControls);
	signals.contextChanged.add(() => reattachTransformControls(editor.selected));

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

	this.configurationToJson = () => {
		const configJson = {
			cameraMatrix: camera.matrix.toArray(),
			clipPlane: viewClipPlane?.configurationToJson()
		};
		return configJson;
	};

	this.fromConfigurationJson = configJson => {
		camera.matrix.fromArray(configJson.cameraMatrix);
		camera.matrix.decompose(camera.position, camera.quaternion, camera.scale);
		viewClipPlane?.fromConfigurationJson(configJson.clipPlane);
	};

	return {
		...this,
		render,
		container,
		controls,
		viewHelper,
		animate,
		config,
		wrapperDiv
	};
}
