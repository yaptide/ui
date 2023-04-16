import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { CSG } from '../libs/csg/csg-lib';
import { debounce } from 'throttle-debounce';

/*
This function is responsible for preparing scene with clipping plane and stencil materials
It creates and manages controls for shifting clipping planes in X,Y,Z axis.
Stencil materials are used as a trick in order to avoid display of transparent inner walls of clipped objects (zones/bodies).
We aim at assigning stencil materials to hold different colors than the walls of the objects and represent the internal material which is filling the zone.
This is especially useful for such clipped views where at the same time internal material and wall of the object is visible at same time
(for example torus clipped by a plane containing its axis of symmetry, stencil material fills two full circles, while wall material is drawn on the visible outer wall).
 */
export function ViewportClippedView2(
	name,
	editor,
	viewport,
	planeHelpers,
	initialObjects,
	signalGeometryChanged,
	signalGeometryAdded,
	signalGeometryRemoved,
	container,
	{ clipPlane, planeHelperColor, planePosLabel }
) {
	this.name = name;
	this.editor = editor;

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
			stencilPlane.translateZ(v - clipPlane.constant);

			// align clipping plane with stencil plane
			clipPlane.constant = v;

			debouncedUpdatePreview();

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
	const planeGeom = new THREE.BoxGeometry(CLIPPING_SIZE, CLIPPING_SIZE, 0.01);

	const clippedObjects = new THREE.Group();
	clippedObjects.name = 'clippedObjects';
	this.scene.add(clippedObjects);

	const crossSectionGroup = new THREE.Group();
	crossSectionGroup.name = 'crossSectionGroup';
	this.scene.add(crossSectionGroup);

	const planeMat = new THREE.MeshBasicMaterial({
		name: 'CrossSectionPlaneMaterial',
		color: 0x00ff00,
		emissive: 0x00ff00,
		transparent: true,
		opacity: 0.1,
		visible: false,
	});

	const stencilPlane = new THREE.Mesh(planeGeom, planeMat); // Cross Section Plane - fill stencil

	stencilPlane.name = 'stencilPlane';
	stencilPlane.onAfterRender = function (renderer) {
		renderer.clearStencil();
	};
	// increase render order to have stencil plane being rendered after other objects
	// we increase the render object by 0.1 following the original code from threejs repo
	stencilPlane.renderOrder = STENCIL_RENDER_ORDER + 0.1;

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

	stencilPlane.updateMatrix();
	let stencilCsg = CSG.fromMesh(stencilPlane);

	// Initialize view with objects
	initialObjects.forEach(object3D => updateMeshIntersection(object3D));

	const debouncedUpdatePreview = debounce(200, () => updatePreview(), { atBegin: false });

	function updatePreview() {
		stencilPlane.updateMatrix();
		stencilCsg = CSG.fromMesh(stencilPlane);
		console.log('updatePreview');
		clippedObjects.children.forEach(crossSectionMesh => {
			const object3D = crossSectionMesh.userData.originalObject;
			updateMeshIntersection(object3D);
		});

		editor.signals.sceneGraphChanged.dispatch();
	}

	function updateMeshIntersection(object3D) {
		clippedObjects.remove(clippedObjects.getObjectByName(object3D.uuid));

		object3D.updateMatrix();
		const objectMesh = CSG.fromMesh(object3D).intersect(stencilCsg);

		const crossSectionMaterial = new THREE.MeshBasicMaterial({
			color: object3D.material.color.clone(),
		});
		const crossSectionMesh = CSG.toMesh(objectMesh, object3D.matrix, crossSectionMaterial);
		crossSectionMesh.name = object3D.uuid;
		crossSectionMesh.userData.originalObject = object3D;

		clippedObjects.add(crossSectionMesh);
	}

	signalGeometryChanged.add(object3D => {
		updateMeshIntersection(object3D);
	});

	signalGeometryAdded.add(object3D => {
		updateMeshIntersection(object3D);
	});

	signalGeometryRemoved.add(object3D => {
		clippedObjects.remove(clippedObjects.getObjectByName(object3D.uuid));
	});

	editor.signals.objectChanged.add(object3D => {
		const crossSectionMesh = clippedObjects.getObjectByName(object3D.uuid);

		if (crossSectionMesh) {
			crossSectionMesh.material.color.copy(object3D.material.color);
			crossSectionMesh.material.needsUpdate = true;
			crossSectionMesh.visible = object3D.visible;
		}
	});


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
