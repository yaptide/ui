import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

/*
This function is responsible for preparing scene with clipping plane and stencil materials
It creates and manages controls for shifting clipping planes in X,Y,Z axis.
Stencil materials are used as a trick in order to avoid display of transparent inner walls of clipped objects (zones/bodies).
We aim at assigning stencil materials to hold different colors than the walls of the objects and represent the internal material which is filling the zone.
This is especially useful for such clipped views where at the same time internal material and wall of the object is visible at same time
(for example torus clipped by a plane containing its axis of symmetry, stencil material fills two full circles, while wall material is drawn on the visible outer wall).
 */
export function ViewportClippedView(
	name,
	editor,
	viewport,
	planeHelpers,
	initialObjects,
	signalGeometryChanged,
	signalGeometryAdded,
	signalGeometryRemoved,
	signalObjectChanged,
	container,
	{ clipPlane, planeHelperColor, planePosLabel }
) {
	this.name = name;

	// default order is zero, we assign higher order to stencil plane to display it in front of other objects
	const STENCIL_RENDER_ORDER = 1;

	// several objects we are using (stencil plan) are limited to a square on a plane with given size (side length)
	// it limits range of applicability of clipping plane
	// it also limits the size (horizontally and vertically) of stencil plane
	// here side length is set to 10 cm
	const CLIPPING_SIZE = 200;

	this.scene = new THREE.Scene();
	this.scene.name = `ClippedViewScene-${name}`;
	this.gui = new GUI({ container });
	this.gui.domElement.style.position = 'absolute';
	this.gui.domElement.style.top = '5px';
	this.gui.domElement.style.right = '5px';

	// Setup plane clipping ui
	const planeHelper = new THREE.PlaneHelper(
		clipPlane,
		CLIPPING_SIZE,
		planeHelperColor ?? 0xffff00
	); // default helper color is yellow
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
			crossSectionGroup.children.forEach((stencilPlane) => { stencilPlane.translateZ(v - clipPlane.constant); });

			// align clipping plane with stencil plane
			clipPlane.constant = v;

			editor.signals.viewportConfigChanged.dispatch({
				name: viewport.name,
				globalPlaneConstant: v
			});
		},

		get 'Helper Visible'() {
			return planeHelper.visible;
		},
		set 'Helper Visible'(v) {
			planeHelper.visible = v;

			editor.signals.viewportConfigChanged.dispatch({
				name: viewport.name,
				helperVisible: v
			});
		}
	};

	// adjust range of movement of clipping plane to -size...+size with given step
	const clipPlaneStep = 0.1;
	this.gui.add(uiProps, planePosProperty, -CLIPPING_SIZE, CLIPPING_SIZE, clipPlaneStep).listen();
	this.gui.add(uiProps, 'Helper Visible').listen();

	// setup plane to display where geometry is clipped
	// in fact this is a square being a subset of plane
	const planeGeom = new THREE.PlaneGeometry(CLIPPING_SIZE, CLIPPING_SIZE);

	const clippedObjects = new THREE.Group();
	clippedObjects.name = 'clippedObjects';
	this.scene.add(clippedObjects);

	const crossSectionGroup = new THREE.Group();
	crossSectionGroup.name = 'crossSectionGroup';
	this.scene.add(crossSectionGroup);

	function addStencilPlane(objectRenderOrder, object3D) {
		const planeMat = new THREE.MeshBasicMaterial({
			name: `CrossSectionPlaneMaterial-${object3D.material.color.getHex()}`,
			color: object3D.material.color.getHex(),
			// opacity: object3D.material.opacity,
			// transparent: object3D.material.transparent,
			visible: true,
			depthWrite: false,
			side: THREE.FrontSide,

			stencilWrite: true,
			stencilRef: 1,
			stencilFunc: THREE.EqualStencilFunc,
			// stencilZPass: THREE.ReplaceStencilOp
		});

		const stencilPlane = new THREE.Mesh(planeGeom, planeMat); // Cross Section Plane - fill stencil
		stencilPlane.name = 'stencilPlane-' + object3D.uuid;
		stencilPlane.onAfterRender = function (renderer) {
			renderer.clearStencil();
		};

		// increase render order to have stencil plane being rendered after other objects
		// we increase the render object by 0.1 following the original code from threejs repo
		stencilPlane.renderOrder = objectRenderOrder + 0.1;

		crossSectionGroup.add(stencilPlane);

		// align stencil plane to clipping plane
		clipPlane.coplanarPoint(stencilPlane.position);
		stencilPlane.lookAt(
			stencilPlane.position.x - clipPlane.normal.x,
			stencilPlane.position.y - clipPlane.normal.y,
			stencilPlane.position.z - clipPlane.normal.z
		);

		// put stencil plane at the same distance from the origin of coord. system as clipping plane
		// in fact there will be completely aligned then
		stencilPlane.translateZ(clipPlane.constant);

		// move back stencil plane by epsilon distance (here 1nm)
		// TODO why back and not to the front ?  # skipcq: JS-0099
		// TODO try to decrease this value in such way that creating geometry of small objects (i.e. um size is still possible)  # skipcq: JS-0099
		stencilPlane.translateZ(-1e-2);

		return stencilPlane;
	}



	// Initialize view with objects
	initialObjects.forEach((object3D, index) => {
		// add stencil plane to the scene

		const stencilGroup = createPlaneStencilGroup(
			object3D.geometry,
			index + 1
		);
		stencilGroup.name = object3D.uuid;
		clippedObjects.add(stencilGroup);

		addStencilPlane(index + 1, object3D);
	});

	// update stencil materials when geometry of bodies and zones is updated
	function updateMeshWithStencilMaterial(object3D) {
		const oldGroup = clippedObjects.getObjectByName(object3D.uuid);
		const renderOrder = oldGroup?.userData.renderOrder ?? clippedObjects.children.length + 1;
		clippedObjects.remove(oldGroup);

		const stencilGroup = createPlaneStencilGroup(
			object3D.geometry,
			renderOrder
		);

		stencilGroup.name = object3D.uuid;
		clippedObjects.add(stencilGroup);

		crossSectionGroup.remove(crossSectionGroup.getObjectByName('stencilPlane-' + object3D.uuid));
		addStencilPlane(renderOrder, object3D);
	}

	signalGeometryChanged.add(object3D => {
		updateMeshWithStencilMaterial(object3D);
	});

	signalGeometryAdded.add(object3D => {
		updateMeshWithStencilMaterial(object3D);
	});

	signalGeometryRemoved.add(object3D => {
		clippedObjects.remove(clippedObjects.getObjectByName(object3D.uuid));
		crossSectionGroup.remove(crossSectionGroup.getObjectByName('stencilPlane-' + object3D.uuid));
	});

	signalObjectChanged.add((object3D, property) => {
		const stencilGroup = clippedObjects.getObjectByName(object3D.uuid);

		if (!stencilGroup) return;

		if (property === 'visible') {
			stencilGroup.visible = object3D.visible;
		}
	});

	// https://github.com/mrdoob/three.js/blob/r132/examples/webgl_clipping_stencil.html
	// Creates mask with stencil where stencil plane should be visible
	const baseMat = new THREE.MeshBasicMaterial();
	baseMat.depthWrite = true;
	baseMat.depthTest = true;
	baseMat.colorWrite = false;
	baseMat.stencilWrite = true;
	baseMat.stencilFunc = THREE.AlwaysStencilFunc;

	// back faces - add stencil
	const backFaceMaterial = baseMat.clone();
	backFaceMaterial.name = 'back faces - add stencil';
	backFaceMaterial.color = new THREE.Color(0x0000FF);
	backFaceMaterial.side = THREE.BackSide;
	backFaceMaterial.clippingPlanes = [clipPlane];
	backFaceMaterial.stencilZPass = THREE.IncrementWrapStencilOp;

	// front faces - remove stencil
	const frontFaceMaterial = baseMat.clone();
	frontFaceMaterial.name = 'front faces - remove stencil';
	frontFaceMaterial.color = new THREE.Color(0xFF0000);
	frontFaceMaterial.side = THREE.FrontSide;
	frontFaceMaterial.clippingPlanes = [clipPlane];
	frontFaceMaterial.stencilZPass = THREE.DecrementWrapStencilOp;

	// const otherObjectsMaterial = frontFaceMaterial.clone();
	// otherObjectsMaterial.name = 'other objects - remove stencil';
	// otherObjectsMaterial.side = THREE.DoubleSide;

	function createPlaneStencilGroup(geometry, renderOrder) {
		const group = new THREE.Group();

		const mesh0 = new THREE.Mesh(geometry, backFaceMaterial);
		mesh0.renderOrder = renderOrder;
		group.add(mesh0);

		const mesh1 = new THREE.Mesh(geometry, frontFaceMaterial);
		mesh1.renderOrder = renderOrder;
		group.add(mesh1);

		group.userData = { renderOrder }

		return group;
	}

	this.reset = () => {
		clippedObjects.clear();
	};

	this.configurationJson = () => {
		return {
			planeConstant: uiProps[planePosProperty],
			visible: uiProps['Helper Visible']
		};
	}

	this.fromConfigurationJson = (json) => {
		uiProps[planePosProperty] = json.planeConstant;
		uiProps['Helper Visible'] = json.visible;
	}
}
