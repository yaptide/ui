import * as THREE from 'three';
import { GUI } from 'three/examples//jsm/libs/dat.gui.module.js';

/*
This function is responsible for preparing scene with clipping plane and stencil materials
It creates and manages controls for shifting clipping planes in X,Y,Z axis.
Stencil materials are used as a trick in order to avoid display of transparent inner walls of clipped objects (zones/bodies).
We aim at assigning stencil materials to hold different colors than the walls of the objects and represent the internal material which is filling the zone.
This is especially useful for such clipped views where at the same time internal material and wall of the object is visible at same time
(for example torus clipped by a plane containing its axis of symmetry, stencil material fills two full circles, while wall material is drawn on the visible outer wall).
 */
export function ViewportClippedView(editor, viewport, planeHelpers, initialObjects, signalGeometryChanged, signalGeometryAdded, signalGeometryRemoved, { clipPlane, planeHelperColor, planePosLabel }) {

    // default order is zero, we assign higher order to stencil plane to display it in front of other objects
    const STENCIL_RENDER_ORDER = 1;

    // several objects we are using (stencil plan) are limited to a square on a plane with given size (side length)
    // it limits range of applicability of clipping plane
    // it also limits the size (horizontally and vertically) of stencil plane
    // here side length is set to 10 cm
    const CLIPPING_SIZE = 100;

    this.scene = new THREE.Scene();
    this.gui = new GUI({});

    // Setup plane clipping ui  
    const planeHelper = new THREE.PlaneHelper(clipPlane, CLIPPING_SIZE, planeHelperColor ?? 0xffff00); // default helper color is yellow
    planeHelpers.add(planeHelper);

    const planePosProperty = `${planePosLabel ?? 'PlanePos'} ${editor.unit.name}`;

    const uiProps = {

        get [planePosProperty]() {

            // distance from a plane to the origin of coordinate system
            // as our planes are parallel to OXY, OYZ or OXZ, this reduces to the distance along normal vector
            return clipPlane.constant;

        },
        set [planePosProperty](v) {

            // take the previous location of clipping plane and shift stencil plane to the desired location of clipping plane
            // we translate in the plane in local coordinate system
            stencilPlane.translateZ(v - clipPlane.constant);

            // align clipping plane with stencil plane
            clipPlane.constant = v;

            editor.signals.viewportConfigChanged.dispatch({ name: viewport.name, globalPlaneConstant: v });

        },

        get 'Helper Visible'() {

            return planeHelper.visible;

        },
        set 'Helper Visible'(v) {

            planeHelper.visible = v;

            editor.signals.viewportConfigChanged.dispatch({ name: viewport.name, helperVisible: v });

        },


    };

    // adjust range of movement of clipping plane to -size...+size with given step
    const clipPlaneStep = 0.1;
    this.gui.add(uiProps, planePosProperty, -CLIPPING_SIZE, CLIPPING_SIZE, clipPlaneStep);
    this.gui.add(uiProps, 'Helper Visible', true);
    this.gui.domElement.style.position = 'absolute';
    this.gui.domElement.style.top = '35px';
    this.gui.domElement.style.right = '-5px';


    // setup plane to display where geometry is clipped
    // in fact this is a square being a subset of plane
    const planeGeom = new THREE.PlaneGeometry(CLIPPING_SIZE, CLIPPING_SIZE);

    const clippedObjects = new THREE.Group();
    this.scene.add(clippedObjects);

    const crossSectionGroup = new THREE.Group();
    this.scene.add(crossSectionGroup);

    const planeMat =
        new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            emissive: 0x00ff00,

            stencilWrite: true,
            stencilRef: 0,
            stencilFunc: THREE.NotEqualStencilFunc,
            stencilFail: THREE.ReplaceStencilOp,
            stencilZFail: THREE.ReplaceStencilOp,
            stencilZPass: THREE.ReplaceStencilOp,

        });

    const stencilPlane = new THREE.Mesh(planeGeom, planeMat); // Cross Section Plane - fill stencil
    stencilPlane.onAfterRender = function (renderer) {

        renderer.clearStencil();

    };
    // increase render order to have stencil plane being rendered after other objects
    // we increase the render object by 0.1 following the original code from threejs repo
    stencilPlane.renderOrder = STENCIL_RENDER_ORDER + .1;

    crossSectionGroup.add(stencilPlane);

    // align stencil plane to clipping plane
    clipPlane.coplanarPoint(stencilPlane.position);
    stencilPlane.lookAt(
        stencilPlane.position.x - clipPlane.normal.x,
        stencilPlane.position.y - clipPlane.normal.y,
        stencilPlane.position.z - clipPlane.normal.z,
    );

    // put stencil plane at the same distance from the origin of coord. system as clipping plane
    // in fact there will be completely aligned then
    stencilPlane.translateZ(clipPlane.constant);

    // move back stencil plane by epsilon distance (here 1nm)
    // TODO why back and not to the front ?  # skipcq: JS-0099
    // TODO try to decrease this value in such way that creating geometry of small objects (i.e. um size is still possible)  # skipcq: JS-0099
    stencilPlane.translateZ(-1e-2);

    // Initialize view with objects
    initialObjects.forEach((object3D, index) => {
        const stencilGroup = createPlaneStencilGroup(object3D.geometry, clipPlane, STENCIL_RENDER_ORDER);
        stencilGroup.name = object3D.uuid;
        clippedObjects.add(stencilGroup);
    });

    // update stencil materials when geometry of bodies and zones is updated
    function updateMeshWithStencilMaterial(object3D) {
        clippedObjects.remove(clippedObjects.getObjectByName(object3D.uuid));

        const stencilGroup = createPlaneStencilGroup(object3D.geometry, clipPlane, STENCIL_RENDER_ORDER);
        stencilGroup.name = object3D.uuid;
        clippedObjects.add(stencilGroup);
    }

    signalGeometryChanged.add((object3D) => {
        updateMeshWithStencilMaterial(object3D);
    });

    signalGeometryAdded.add((object3D) => {
        updateMeshWithStencilMaterial(object3D);
    });

    signalGeometryRemoved.add((object3D) => {
        clippedObjects.remove(clippedObjects.getObjectByName(object3D.uuid));
    });

    // https://github.com/mrdoob/three.js/blob/r132/examples/webgl_clipping_stencil.html
    // Creates mask with stencil where stencil plane should be visible
    function createPlaneStencilGroup(geometry, plane, renderOrder) {

        const group = new THREE.Group();
        const baseMat = new THREE.MeshBasicMaterial();
        baseMat.depthWrite = false;
        baseMat.depthTest = false;
        baseMat.colorWrite = false;
        baseMat.stencilWrite = true;
        baseMat.stencilFunc = THREE.AlwaysStencilFunc;

        // back faces - add stencil
        const mat0 = baseMat.clone();
        mat0.side = THREE.BackSide;
        mat0.clippingPlanes = [plane];
        mat0.stencilFail = THREE.IncrementWrapStencilOp;
        mat0.stencilZFail = THREE.IncrementWrapStencilOp;
        mat0.stencilZPass = THREE.IncrementWrapStencilOp;

        const mesh0 = new THREE.Mesh(geometry, mat0);
        mesh0.renderOrder = renderOrder;
        group.add(mesh0);

        // front faces - remove stencil
        const mat1 = baseMat.clone();
        mat1.side = THREE.FrontSide;
        mat1.clippingPlanes = [plane];
        mat1.stencilFail = THREE.DecrementWrapStencilOp;
        mat1.stencilZFail = THREE.DecrementWrapStencilOp;
        mat1.stencilZPass = THREE.DecrementWrapStencilOp;

        const mesh1 = new THREE.Mesh(geometry, mat1);
        mesh1.renderOrder = renderOrder;

        group.add(mesh1);

        return group;

    }


    this.reset = () => {
        clippedObjects.clear();
    }

}
