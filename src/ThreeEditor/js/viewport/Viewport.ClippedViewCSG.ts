import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import { debounce } from 'throttle-debounce';
import { Viewport } from './Viewport';
import { CSG } from '../../util/CSG/CSG';
import { Editor } from '../Editor';
import { Signal } from 'signals';

type ClippedViewConfigurationJson = {
	visible: boolean;
	planeConstant: number;
};

interface ViewportClippedView {
	name: string;
	editor: Editor;
	scene: THREE.Scene;
	gui: GUI;
	reset: () => void;
	configurationToJson: () => ClippedViewConfigurationJson;
	fromConfigurationJson: (config: ClippedViewConfigurationJson) => void;
}

export function ViewportClippedViewCSG<
	T extends THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>
>(
	this: ViewportClippedView,
	name: string,
	editor: Editor,
	viewport: typeof Viewport,
	planeHelpers: THREE.Group,
	initialObjects: T[],
	signalGeometryChanged: Signal<T>,
	signalGeometryAdded: Signal<T>,
	signalGeometryRemoved: Signal<T>,
	container: HTMLElement,
	{
		clipPlane,
		planeHelperColor,
		planePosLabel
	}: { clipPlane: THREE.Plane; planeHelperColor: number; planePosLabel: string }
) {
	this.name = name;
	this.editor = editor;

	const INTERSECTION_SIZE = 200;
	const INTERSECTION_WIDTH = 0.01;
	const CLIP_PLANE_STEP = 0.1;

	this.scene = new THREE.Scene();
	this.scene.name = `ClippedViewScene-${name}`;
	this.gui = new GUI({ container });
	this.gui.domElement.style.position = 'absolute';
	this.gui.domElement.style.top = '5px';
	this.gui.domElement.style.right = '5px';

	// Setup plane clipping ui
	const planeHelper = new THREE.PlaneHelper(
		clipPlane,
		INTERSECTION_SIZE,
		planeHelperColor ?? 0xffff00
	); // default helper color is yellow
	planeHelpers.add(planeHelper);

	const planePosProperty = `${planePosLabel ?? 'PlanePos'} ${editor.unit.name}`;

	const uiProps: Record<string, any> = {
		get [planePosProperty](): number {
			// distance from a plane to the origin of coordinate system
			// as our planes are parallel to OXY, OYZ or OXZ, this reduces to the distance along normal vector
			return clipPlane.constant;
		},
		set [planePosProperty](v: number) {
			// take the previous location of clipping plane and shift stencil plane to the desired location of clipping plane
			// we translate in the plane in local coordinate system
			intersectionBox.translateZ(v - clipPlane.constant);

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
	this.gui
		.add(uiProps, planePosProperty, -INTERSECTION_SIZE, INTERSECTION_SIZE, CLIP_PLANE_STEP)
		.listen();
	this.gui.add(uiProps, 'Helper Visible').listen();

	const intersectionCsgGeometry = new THREE.BoxGeometry(
		INTERSECTION_SIZE,
		INTERSECTION_SIZE,
		INTERSECTION_WIDTH
	);
	const intersectionBox = new THREE.Mesh(intersectionCsgGeometry); // Cross Section Plane - fill stencil
	intersectionBox.name = `intersectionBox-${name}`;

	// align stencil plane to clipping plane
	clipPlane.coplanarPoint(intersectionBox.position);
	intersectionBox.lookAt(
		intersectionBox.position.x - clipPlane.normal.x,
		intersectionBox.position.y - clipPlane.normal.y,
		intersectionBox.position.z - clipPlane.normal.z
	);

	// put stencil plane at the same distance from the origin of coord. system as clipping plane
	intersectionBox.translateZ(clipPlane.constant);

	intersectionBox.updateMatrix();
	let intersectionCsg = CSG.fromMesh(intersectionBox);

	const clippedObjects = new THREE.Group();
	clippedObjects.name = 'clippedObjects';
	this.scene.add(clippedObjects);

	// Initialize view with objects
	initialObjects.forEach((object3D: T) => updateMeshIntersection(object3D));

	const debouncedUpdatePreview = debounce(200, () => updatePreview(), { atBegin: false });

	function updatePreview() {
		intersectionBox.updateMatrix();
		intersectionCsg = CSG.fromMesh(intersectionBox);
		clippedObjects.children
			.map(o => o.userData.originalObject)
			.forEach((object3D: T) => updateMeshIntersection(object3D));

		editor.signals.sceneGraphChanged.dispatch();
	}

	function updateMeshIntersection(object3D: T) {
		const crossSectionObject = clippedObjects.getObjectByName(object3D.uuid);
		if (crossSectionObject) clippedObjects.remove(crossSectionObject);

		object3D.updateMatrix();
		let crossSectionMesh: T;

		if (
			'position' in object3D.geometry.attributes &&
			object3D.geometry.attributes.position.count > 0
		) {
			const objectMesh = CSG.fromMesh(object3D).intersect(intersectionCsg);

			const crossSectionMaterial = new THREE.MeshBasicMaterial({
				color: object3D.material.color.clone()
			});

			crossSectionMesh = CSG.toMesh(objectMesh, object3D.matrix, crossSectionMaterial) as T;
		} else {
			crossSectionMesh = new THREE.Mesh() as T;
		}

		crossSectionMesh.name = object3D.uuid;
		crossSectionMesh.userData.originalObject = object3D;
		crossSectionMesh.visible = object3D.visible;

		clippedObjects.add(crossSectionMesh);
	}

	signalGeometryChanged.add((object3D: T) => {
		updateMeshIntersection(object3D);
	});

	signalGeometryAdded.add((object3D: T) => {
		updateMeshIntersection(object3D);
	});

	signalGeometryRemoved.add((object3D: T) => {
		const crossSectionObject = clippedObjects.getObjectByName(object3D.uuid);
		if (crossSectionObject) clippedObjects.remove(crossSectionObject);
	});

	editor.signals.objectChanged.add((object3D: T) => {
		const crossSectionMesh = clippedObjects.getObjectByName(object3D.uuid) as T;

		if (crossSectionMesh) {
			crossSectionMesh.material.color.copy(object3D.material.color);
			crossSectionMesh.material.needsUpdate = true;
			crossSectionMesh.visible = object3D.visible;
		}
	});

	this.reset = () => {
		clippedObjects.clear();
	};

	this.configurationToJson = (): ClippedViewConfigurationJson => {
		return {
			planeConstant: uiProps[planePosProperty],
			visible: uiProps['Helper Visible']
		};
	};

	this.fromConfigurationJson = (json: ClippedViewConfigurationJson) => {
		uiProps[planePosProperty] = json.planeConstant;
		uiProps['Helper Visible'] = json.visible;
	};
}
