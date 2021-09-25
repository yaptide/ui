import * as THREE from 'three';
import { GUI } from 'three/examples//jsm/libs/dat.gui.module.js';

export function ViewportClippedView(editor, viewport, planeHelpers, initialObjects, signalGeometryChanged, { clipPlane, planeHelperColor, planePosLabel }) {

    const STENCIL_RENDER_ORDER = 1;
    const CLIPPING_SIZE = 10;

    this.scene = new THREE.Scene();
    this.gui = new GUI({});

    // Setup plane clipping ui  
    const planeHelper = new THREE.PlaneHelper(clipPlane, CLIPPING_SIZE, planeHelperColor ?? 0xffff00); // default helper color is yellow
    planeHelpers.add(planeHelper);

    const planePosProperty = planePosLabel ?? 'PlanePos';

    const uiProps = {

        get [planePosProperty]() {

            return clipPlane.constant;

        },
        set [planePosProperty](v) {

            crossSectionPlane.translateZ(v - clipPlane.constant); // translate Cross Section Plane with clip plane

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

    this.gui.add(uiProps, planePosProperty, -CLIPPING_SIZE, CLIPPING_SIZE, 0.1);
    this.gui.add(uiProps, 'Helper Visible', true);
    this.gui.domElement.style.position = 'absolute';
    this.gui.domElement.style.top = '35px';
    this.gui.domElement.style.right = '-5px';


    // setup plane to display where geometry is clipped

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

    const crossSectionPlane = new THREE.Mesh(planeGeom, planeMat); // Cross Section Plane - fill stencil
    crossSectionPlane.onAfterRender = function (renderer) {

        renderer.clearStencil();

    };
    crossSectionPlane.renderOrder = STENCIL_RENDER_ORDER + .1; // must be rendered after clipped objects

    crossSectionGroup.add(crossSectionPlane);

    // align mesh plane to clipping plane 
    clipPlane.coplanarPoint(crossSectionPlane.position);
    crossSectionPlane.lookAt(
        crossSectionPlane.position.x - clipPlane.normal.x,
        crossSectionPlane.position.y - clipPlane.normal.y,
        crossSectionPlane.position.z - clipPlane.normal.z,
    );

    crossSectionPlane.translateZ(clipPlane.constant); // copy distance[from (0,0,0)] from clip plane to Cross Section Plane

    crossSectionPlane.translateZ(-.01); // offset Cross Section Plane to not be clipped by renderer

    // Initialize view with objects

    initialObjects.forEach((object3D, index) => {
        const stencilGroup = createPlaneStencilGroup(object3D.geometry, clipPlane, STENCIL_RENDER_ORDER);
        stencilGroup.name = object3D.uuid;
        clippedObjects.add(stencilGroup);

    });

    // Signal

    signalGeometryChanged.add(function (object3D) {
        clippedObjects.remove(clippedObjects.getObjectByName(object3D.uuid));

        const stencilGroup = createPlaneStencilGroup(object3D.geometry, clipPlane, STENCIL_RENDER_ORDER);
        stencilGroup.name = object3D.uuid;
        clippedObjects.add(stencilGroup);

    });

    // https://github.com/mrdoob/three.js/blob/r132/examples/webgl_clipping_stencil.html
    // Creates mask with stencil where Cross Section Plane should be visible
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

}
