import * as THREE from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { SetPositionCommand } from './commands/SetPositionCommand';
import { SetRotationCommand } from './commands/SetRotationCommand';
import { SetScaleCommand } from './commands/SetScaleCommand';
import { EditorControls } from './EditorControls';

import { UIPanel } from "./libs/ui";
import { ViewHelper } from './Viewport.ViewHelper';

export function ViewPanel(name, editor, viewWidth, viewHeight, { objects, grid, oldCamera, selectionBox }) {
    let { scene, sceneHelpers, signals } = editor;

    let showSceneHelpers = true;

    let sceneViewHelpers = new THREE.Scene();

    let camera = editor.scene.getObjectByName(name) ?? oldCamera.clone();
    camera.name = name;
    editor.scene.add(camera);

    let container = new UIPanel();
    container.setId('ViewPanel');
    container.setPosition('absolute');

    let canvas = document.createElement('canvas');
    container.dom.appendChild(canvas);
    canvas.width = viewWidth * window.devicePixelRatio;
    canvas.height = viewHeight * window.devicePixelRatio;

    let context = canvas.getContext('2d');

    let viewHelper = new ViewHelper(camera, container);

    let cachedRenderer = null;

    function render(renderer = cachedRenderer) {
        cachedRenderer = renderer;

        if (!renderer) return;

        camera.aspect = 1;
        camera.updateProjectionMatrix();

        scene.add(grid);
        renderer.setSize(canvas.width, canvas.height);
        renderer.render(scene, camera);
        scene.remove(grid);

        renderer.autoClear = false;
        if (showSceneHelpers) {
            renderer.render(sceneHelpers, camera);
            renderer.render(sceneViewHelpers, camera);
            viewHelper.render(renderer);
        }
        renderer.autoClear = true;

        context.drawImage(renderer.domElement, 0, 0);

    };

    function animate(delta) {
        if (viewHelper.animating === true) {

            viewHelper.update(delta);

            return true;
        }

        return false;
    }



    var objectPositionOnDown = null;
    var objectRotationOnDown = null;
    var objectScaleOnDown = null;

    var transformControls = new TransformControls(camera, container.dom);
    transformControls.addEventListener('change', function () {

        var object = transformControls.object;

        if (object !== undefined) {

            selectionBox.setFromObject(object);

            var helper = editor.helpers[object.id];

            if (helper !== undefined && helper.isSkeletonHelper !== true) {

                helper.update();

            }

            signals.refreshSidebarObject3D.dispatch(object);

        }

        render();

    });

    transformControls.addEventListener('mouseDown', function () {

        var object = transformControls.object;

        objectPositionOnDown = object.position.clone();
        objectRotationOnDown = object.rotation.clone();
        objectScaleOnDown = object.scale.clone();

        controls.enabled = false;


    });

    transformControls.addEventListener('mouseUp', function () {

        var object = transformControls.object;

        if (object !== undefined) {

            switch (transformControls.getMode()) {

                case 'translate':

                    if (!objectPositionOnDown.equals(object.position)) {

                        editor.execute(new SetPositionCommand(editor, object, object.position, objectPositionOnDown));

                    }

                    break;

                case 'rotate':

                    if (!objectRotationOnDown.equals(object.rotation)) {

                        editor.execute(new SetRotationCommand(editor, object, object.rotation, objectRotationOnDown));

                    }

                    break;

                case 'scale':

                    if (!objectScaleOnDown.equals(object.scale)) {

                        editor.execute(new SetScaleCommand(editor, object, object.scale, objectScaleOnDown));

                    }

                    break;

                default:
                    console.error(transformControls.getMode());
            }

        }

        controls.enabled = true;

    });

    
	sceneViewHelpers.add(transformControls);



    // object picking

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    function getIntersects(point, objects) {

        mouse.set((point.x * 2) - 1, - (point.y * 2) + 1);

        raycaster.setFromCamera(mouse, camera);

        return raycaster.intersectObjects(objects)
            .filter(intersect => intersect.object.visible === true);

    }

    var onDownPosition = new THREE.Vector2();
    var onUpPosition = new THREE.Vector2();
    var onDoubleClickPosition = new THREE.Vector2();

    function getMousePosition(dom, x, y) {

        var rect = dom.getBoundingClientRect();
        return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];

    }

    function handleClick() {

        if (onDownPosition.distanceTo(onUpPosition) === 0) {

            var intersects = getIntersects(onUpPosition, objects);

            if (intersects.length > 0) {

                var object = intersects[0].object;

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

        var array = getMousePosition(container.dom, event.clientX, event.clientY);
        onDownPosition.fromArray(array);

        document.addEventListener('mouseup', onMouseUp, false);

    }

    function onMouseUp(event) {

        var array = getMousePosition(container.dom, event.clientX, event.clientY);
        onUpPosition.fromArray(array);

        handleClick();

        document.removeEventListener('mouseup', onMouseUp, false);

    }

    function onTouchStart(event) {

        var touch = event.changedTouches[0];

        var array = getMousePosition(container.dom, touch.clientX, touch.clientY);
        onDownPosition.fromArray(array);

        document.addEventListener('touchend', onTouchEnd, false);

    }

    function onTouchEnd(event) {

        var touch = event.changedTouches[0];

        var array = getMousePosition(container.dom, touch.clientX, touch.clientY);
        onUpPosition.fromArray(array);

        handleClick();

        document.removeEventListener('touchend', onTouchEnd, false);

    }

    function onDoubleClick(event) {

        var array = getMousePosition(container.dom, event.clientX, event.clientY);
        onDoubleClickPosition.fromArray(array);

        var intersects = getIntersects(onDoubleClickPosition, objects);

        if (intersects.length > 0) {

            var intersect = intersects[0];

            signals.objectFocused.dispatch(intersect.object);

        }

    }

    container.dom.addEventListener('mousedown', onMouseDown, false);
    container.dom.addEventListener('touchstart', onTouchStart, false);
    container.dom.addEventListener('dblclick', onDoubleClick, false);

    // controls need to be added *after* main logic,
    // otherwise controls.enabled doesn't work.

    var controls = new EditorControls(camera, container.dom);
    controls.addEventListener('change', function () {

        signals.cameraChanged.dispatch(camera);
        signals.refreshSidebarObject3D.dispatch(camera);

    });
    viewHelper.controls = controls;


    signals.transformModeChanged.add(function (mode) {

		transformControls.setMode(mode);

	});

	signals.snapChanged.add(function (dist) {

		transformControls.setTranslationSnap(dist);

	});

	signals.spaceChanged.add(function (space) {

		transformControls.setSpace(space);

	});

    signals.objectSelected.add(function (object) {


		transformControls.detach();

		if (object !== null && object !== scene && object !== camera) {
		
			transformControls.attach(object);

		}

		render();

	});

    signals.objectRemoved.add(function (object) {

		controls.enabled = true;

		if (object === transformControls.object) {

			transformControls.detach();

		}

	});


    signals.showHelpersChanged.add(function (showHelpers) {

		transformControls.enabled = showHelpers;

		render();

	});


    return {
        render,
        container,
        controls,
        viewHelper,
        animate
    }

}