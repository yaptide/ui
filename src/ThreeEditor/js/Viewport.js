import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { SetPositionCommand, SetRotationCommand, SetScaleCommand } from './commands/Commands';
import { EditorOrbitControls } from './EditorOrbitControls';
import { UIPanel } from "./libs/ui";
import { ViewportCamera } from './Viewport.Camera.js';
import { ViewportClippedView as ViewportClipPlane } from './Viewport.ClipPlane';
import { ViewHelper } from './Viewport.ViewHelper';

// Part of code from https://github.com/mrdoob/three.js/blob/r131/editor/js/Viewport.js

export function Viewport(
    name, editor,
    { objects, grid, planeHelpers, selectionBox },
    { orthographic, cameraPosition, cameraUp, clipPlane, planePosLabel, planeHelperColor, showPlaneHelpers, gridRotation } = {}
) {

    this.name = name;

    const { scene, zonesManager, sceneHelpers, signals } = editor;

    let config = {
        showSceneHelpers: true,
        showZones: true,
        selectZones: false,
        visible: false,
    }

    let sceneViewHelpers = new THREE.Scene();

    let container = new UIPanel();
    container.setId('ViewPanel');
    container.setPosition('relative');
    container.setOverflow("hidden");
    container.dom.setAttribute('tabindex', '0');


    let canvas = document.createElement('canvas');
    container.dom.appendChild(canvas);


    let context = canvas.getContext('2d');

    let cameraPersp = new THREE.PerspectiveCamera(50, 1, 0.001, 10000);
    cameraPersp.name = "Perspective";
    cameraPersp.position.copy(cameraPosition ?? new THREE.Vector3(0, 10, 10)); // default camera position other than (0,0,0) to see anything

    let cameraOrtho = new THREE.OrthographicCamera(1 / - 2, 1 / 2, 1 / 2, 1 / - 2, 0.001, 10000);
    cameraOrtho.name = "Orthographic";
    cameraOrtho.position.copy(cameraPersp.position);
    cameraOrtho.zoom = .2;

    // in clipping plane views only Orthographic camera is used, hence is "up" axis adjustment is required we do so
    cameraUp && cameraOrtho.up.copy(cameraUp);

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

    if (!orthographic)
        container.add(new ViewportCamera(this, cameras));

    let viewHelper = new ViewHelper(camera, container);
    viewHelper.disabled = orthographic;

    let viewClipPlane = null;
    if (clipPlane) {
        viewClipPlane = new ViewportClipPlane(
            editor, this, planeHelpers, zonesManager.children, signals.zoneGeometryChanged, signals.zoneAdded, signals.zoneRemoved,
            { clipPlane, planeHelperColor, planePosLabel });

        container.dom.appendChild(viewClipPlane.gui.domElement);
    }

    let cachedRenderer = null;

    function render(renderer = cachedRenderer) {
        if (!config.visible) return;

        cachedRenderer = renderer;

        if (!renderer) return;

        if (clipPlane)
            renderer.clippingPlanes = [clipPlane];

        // applying rotation to the grid plane, if not provided set default rotation to none
        // by default grid plane lies within XZ plane
        grid.rotation.copy(gridRotation ?? new THREE.Euler(0, 0, 0));

        renderer.setSize(canvas.width, canvas.height);

        renderer.render(scene, camera);

        renderer.autoClear = false;

        if (config.showZones)
            renderer.render(zonesManager, camera);

        if (clipPlane)
            renderer.render(viewClipPlane.scene, camera);

        renderer.clippingPlanes = []; // clear clipping planes for next renders

        if (config.showSceneHelpers) {

            planeHelpers.visible = showPlaneHelpers ?? false;

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

    let objectPositionOnDown = null;
    let objectRotationOnDown = null;
    let objectScaleOnDown = null;

    let transformControls = new TransformControls(camera, container.dom);
    transformControls.addEventListener('change', () => {

        let object = transformControls.object;

        if (object !== undefined) {

            selectionBox.setFromObject(object);

            let helper = editor.helpers[object.id];

            if (helper !== undefined && helper.isSkeletonHelper !== true) {

                helper.update();

            }

            signals.refreshSidebarObject3D.dispatch(object);

        }

        render();

    });

    transformControls.addEventListener('mouseDown', () => {

        let object = transformControls.object;

        objectPositionOnDown = object.position.clone();
        objectRotationOnDown = object.rotation.clone();
        objectScaleOnDown = object.scale.clone();

        controls.enabled = false;


    });

    transformControls.addEventListener('mouseUp', () => {

        let object = transformControls.object;

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

    window.addEventListener('keydown', (event) => {

        switch (event.key) {

            case 'Shift': // Shift
                transformControls.setTranslationSnap(1);
                transformControls.setRotationSnap(THREE.MathUtils.degToRad(15));
                break;

            default:
        }

    });

    window.addEventListener('keyup', (event) => {

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

    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();

    function getIntersects(point, validObjects) {

        mouse.set((point.x * 2) - 1, - (point.y * 2) + 1);

        raycaster.setFromCamera(mouse, camera);

        return raycaster.intersectObjects(validObjects)
            .filter(intersect => intersect.object.visible === true);

    }

    let onDownPosition = new THREE.Vector2();
    let onUpPosition = new THREE.Vector2();
    let onDoubleClickPosition = new THREE.Vector2();

    function getMousePosition(dom, x, y) {

        let rect = dom.getBoundingClientRect();
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

            let intersects = getIntersects(
                onUpPosition,
                config.selectZones
                    ? zonesManager.zonesContainer.children
                    : objects
            );

            if (intersects.length > 0) {

                let object = intersects[0].object;

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
        let array = getMousePosition(container.dom, event.clientX, event.clientY);
        onDownPosition.fromArray(array);

        document.addEventListener('mouseup', onMouseUp, false);

    }

    function onMouseUp(event) {

        let array = getMousePosition(container.dom, event.clientX, event.clientY);
        onUpPosition.fromArray(array);

        handleClick();

        document.removeEventListener('mouseup', onMouseUp, false);

    }

    function onTouchStart(event) {

        let touch = event.changedTouches[0];

        let array = getMousePosition(container.dom, touch.clientX, touch.clientY);
        onDownPosition.fromArray(array);

        document.addEventListener('touchend', onTouchEnd, false);

    }

    function onTouchEnd(event) {

        let touch = event.changedTouches[0];

        let array = getMousePosition(container.dom, touch.clientX, touch.clientY);
        onUpPosition.fromArray(array);

        handleClick();

        document.removeEventListener('touchend', onTouchEnd, false);

    }

    function onDoubleClick(event) {

        let array = getMousePosition(container.dom, event.clientX, event.clientY);
        onDoubleClickPosition.fromArray(array);

        let intersects = getIntersects(onDoubleClickPosition, objects);

        if (intersects.length > 0) {

            let intersect = intersects[0];

            signals.objectFocused.dispatch(intersect.object);

        }

    }

    function canBeTransformed(object) {
        // Check if object can be transformed. 
        // For our usage it would be only geometries included on the scene. 
        // Amount of geometries can differ form project to project thus we check only if it isn't mesh.
        // unionOperations is property unique to zones that shoudn't be transformed with controler.
        return  object
            && !object.isScene
            && !object.isCamera
            && !object.isCSGZone
            && !object.isBoundingZone
            && !object.isCSGZonesContainer;
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

    container.dom.addEventListener('keydown', (event) => {

        switch (event.code) {
            case 'KeyC': // C
                const position = camera.position.clone();

                camera = camera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
                updateCamera(camera, position);

                break;

            case 'ControlLeft':
            case 'ControlRight':
                config.selectZones = true;
                break;

            default:
                break;

        }

    });
    container.dom.addEventListener('keyup', (event) => {

        switch (event.code) {
            case 'ControlLeft':
            case 'ControlRight':
                config.selectZones = false;
                break;

            default:
                break;
        }
    });

    container.dom.addEventListener('mousedown', onMouseDown, false);
    container.dom.addEventListener('touchstart', onTouchStart, false);
    container.dom.addEventListener('dblclick', onDoubleClick, false);

    signals.transformModeChanged.add((mode) => {

        transformControls.setMode(mode);

    });

    signals.snapChanged.add((dist) => {

        transformControls.setTranslationSnap(dist);

    });

    signals.spaceChanged.add((space) => {

        transformControls.setSpace(space);

    });

    signals.objectSelected.add((object) => {

        reattachTransformControls(object);
        render();

    });

    signals.objectRemoved.add((object) => {

        controls.enabled = true;

        if (object === transformControls.object) {

            transformControls.detach();

        }

    });

    signals.showHelpersChanged.add((showHelpers) => {

        transformControls.enabled = showHelpers;

        render();

    });

    //YAPTIDE signals
    signals.objectChanged.add(() => {

        render();

    });

    signals.showZonesChanged.add((showZones) => {

        config.showZones = showZones;

        render();
    })

    signals.selectModeChanged.add((mode) => {
        //TODO: clicking on zones selects them if zoneSelectionMode is enabled
    })


    function setSize(viewWidth = container.dom.offsetWidth, viewHeight = container.dom.offsetHeight) {
        //prevent canvas from being empty 
        canvas.width = Math.max(viewWidth, 2);
        canvas.height = Math.max(viewHeight, 2);
        updateAspectRatio();
    }

    this.reset = function () {
        controls.reset();
        viewClipPlane && viewClipPlane.reset();
    }

    this.setCameraFromUuid = function (uuid) {
        let newCam = cameras.find((e) => e.uuid === uuid);
        if (newCam)
            this.camera = newCam;
        else
            console.error(`No camera with uuid: [${uuid}] in this viewport`);
    }


    return {
        ...this,
        render,
        container,
        controls,
        viewHelper,
        animate,
        setSize,
        config
    }

}
