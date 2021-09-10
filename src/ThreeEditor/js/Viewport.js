import * as THREE from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { SetPositionCommand } from './commands/SetPositionCommand';
import { SetRotationCommand } from './commands/SetRotationCommand';
import { SetScaleCommand } from './commands/SetScaleCommand';

import { ViewportCamera } from './Viewport.Camera.js';
import { ViewportInfo } from './Viewport.Info.js';

import { UIPanel } from "./libs/ui";
import { ViewHelper } from './Viewport.ViewHelper';
import { EditorOrbitControls } from './EditorOrbitControls';

export function Viewport(name, editor, { objects, grid, selectionBox }, orthographic, cameraPosition) {

    let { scene, sceneHelpers, signals } = editor;

    let config = {
        showSceneHelpers: true,
        visible: false,
    }

    let sceneViewHelpers = new THREE.Scene();

    let container = new UIPanel();
    container.setId('ViewPanel');
    container.setPosition('relative');
    container.setOverflow("hidden");
    container.dom.setAttribute('tabindex', '0');


    container.add(new ViewportInfo(editor));

    let canvas = document.createElement('canvas');
    container.dom.appendChild(canvas);
    // canvas.width = canvas.height = 100;

    let context = canvas.getContext('2d');

    let cameraPersp = new THREE.PerspectiveCamera(50, 1, 0.001, 10000);
    cameraPersp.name = "Perspective";
    cameraPersp.position.copy(cameraPosition ?? new THREE.Vector3(0, 5, 10));
    cameraPersp.lookAt(new THREE.Vector3());

    let cameraOrtho = new THREE.OrthographicCamera(1 / - 2, 1 / 2, 1 / 2, 1 / - 2, 0.001, 10000);
    cameraOrtho.name = "Orthographic";
    cameraOrtho.position.copy(cameraPersp.position);
    cameraOrtho.zoom = .2;
    cameraOrtho.lookAt(new THREE.Vector3());

    let cameras = [cameraOrtho, cameraPersp];

    let camera = orthographic ? cameraOrtho : cameraPersp;
    updateAspectRatio();
    Object.defineProperty(this, 'camera', {
        get() { return camera },
        set(value) {

            const position = camera.position.clone();

            camera = value;

            updateCamera(camera, position);
        }
    });

    container.add(new ViewportCamera(this, cameras));
    let viewHelper = new ViewHelper(camera, container);

    let cachedRenderer = null;

    let localPlane = new THREE.Plane(new THREE.Vector3(0, - 1, 0), 0.000001);
    if (name === "ViewPanel1")
        localPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.000001);
    if (name === "ViewPanel4")
        localPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.000001);
    // const helper = new THREE.PlaneHelper(localPlane, 10, 0xffff00);
    // sceneHelpers.add(helper);

    function render(renderer = cachedRenderer) {
        if (!config.visible) return;

        cachedRenderer = renderer;

        if (!renderer) return;

        if (name !== "ViewPanel2" && name !== "ViewPanel")
            renderer.clippingPlanes = [localPlane];

        // Adding/removing grid to scene so materials with depthWrite false
        // don't render under the grid.
        scene.add(grid);
        renderer.setSize(canvas.width, canvas.height);
        renderer.render(scene, camera);
        scene.remove(grid);
        renderer.clippingPlanes = [];

        renderer.autoClear = false;
        if (config.showSceneHelpers) {
            renderer.render(sceneHelpers, camera);
            renderer.render(sceneViewHelpers, camera);
            viewHelper.render(renderer);
        }
        renderer.autoClear = true;

        context.drawImage(renderer.domElement, 0, 0);

    };

    function animate(delta) {
        if (!config.visible) return false;

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

    function updateCamera(camera, position) {
        camera.position.copy(position);

        controls.object = camera;
        transformControls.camera = camera;
        viewHelper.editorCamera = camera;

        camera.lookAt(controls.target.x, controls.target.y, controls.target.z);
        updateAspectRatio();
    }

    container.dom.addEventListener('keydown', function (event) {

        switch (event.code) {
            case 'KeyC': // C
                const position = camera.position.clone();

                camera = camera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
                updateCamera(camera, position);

                break;

            default:

        }

    });

    container.dom.addEventListener('mousedown', onMouseDown, false);
    container.dom.addEventListener('touchstart', onTouchStart, false);
    container.dom.addEventListener('dblclick', onDoubleClick, false);

    // controls need to be added *after* main logic,
    // otherwise controls.enabled doesn't work.

    var controls = new EditorOrbitControls(camera, container.dom);
    controls.addEventListener('change', function () {

        signals.cameraChanged.dispatch(camera);
        signals.refreshSidebarObject3D.dispatch(camera);
        // console.log(name, controls.getAzimuthalAngle(), controls.getPolarAngle());

    });
    viewHelper.controls = controls;

    //TODO: add fixed axis to controls



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


    function setSize(viewWidth = container.dom.offsetWidth, viewHeight = container.dom.offsetHeight) {
        canvas.width = viewWidth;
        canvas.height = viewHeight;
        updateAspectRatio();
    }


    this.setCameraFromUuid = function (uuid) {
        let newCam = cameras.find((e) => e.uuid === uuid);
        if (newCam)
            this.camera = newCam;
        else
            console.error(`No camera with uuid: [${uuid}] in this viewport`);
    }


    return {
        render,
        container,
        controls,
        viewHelper,
        animate,
        setSize,
        config
    }

}