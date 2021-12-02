import Signal from 'signals';
import * as THREE from 'three';
import { generateSimulationInfo } from '../util/AdditionalUserData';
import { Beam } from '../util/Beam';
import * as CSG from '../util/CSG/CSG';
import { DetectManager } from '../util/Detect/DetectManager';
import MaterialsManager from '../util/Materials/MaterialsManager';
import { EditorObjectLoader } from '../util/ObjectLoader';
import { Config } from './Config.js';
import { ContextManager } from './Editor.Context';
import { History as _History } from './History.js';
import { Loader } from './Loader.js';
import { Storage as _Storage } from './Storage.js';
import { Strings } from './Strings.js';

var _DEFAULT_CAMERA = new THREE.PerspectiveCamera(50, 1, 0.01, 1000);
_DEFAULT_CAMERA.name = 'Camera';
_DEFAULT_CAMERA.position.set(0, 5, 10);
_DEFAULT_CAMERA.lookAt(new THREE.Vector3());

export const JSON_VERSION = 0.2;

export function Editor(container) {
	this.signals = {
		// script

		editScript: new Signal(),

		// notifications

		editorCleared: new Signal(),

		savingStarted: new Signal(),
		savingFinished: new Signal(),

		transformModeChanged: new Signal(),
		snapChanged: new Signal(),
		spaceChanged: new Signal(),
		rendererCreated: new Signal(),
		rendererUpdated: new Signal(),

		sceneBackgroundChanged: new Signal(),
		sceneEnvironmentChanged: new Signal(),
		sceneGraphChanged: new Signal(),
		sceneRendered: new Signal(),

		cameraChanged: new Signal(),
		cameraResetted: new Signal(),

		geometryChanged: new Signal(),

		objectSelected: new Signal(),
		objectFocused: new Signal(),

		objectAdded: new Signal(),
		objectChanged: new Signal(),
		objectRemoved: new Signal(),

		//YAPTIDE zones
		zoneAdded: new Signal(),
		zoneChanged: new Signal(),
		zoneGeometryChanged: new Signal(),
		zoneEmpty: new Signal(),
		zoneRemoved: new Signal(),

		//YAPTIDE detect
		detectGeometryAdded: new Signal(),
		detectGeometryRemoved: new Signal(),
		detectGeometryChanged: new Signal(),

		detectFilterAdded: new Signal(),
		detectFilterRemoved: new Signal(),
		detectFilterChanged: new Signal(),
		dataObjectSelected: new Signal(),

		cameraAdded: new Signal(),
		cameraRemoved: new Signal(),

		helperAdded: new Signal(),
		helperRemoved: new Signal(),

		materialAdded: new Signal(),
		materialChanged: new Signal(),
		materialRemoved: new Signal(),

		scriptAdded: new Signal(),
		scriptChanged: new Signal(),
		scriptRemoved: new Signal(),

		windowResize: new Signal(),

		showGridChanged: new Signal(),
		showHelpersChanged: new Signal(),
		refreshSidebarObject3D: new Signal(),
		historyChanged: new Signal(),

		viewportCameraChanged: new Signal(),

		animationStopped: new Signal(),

		// YAPTIDE signals
		selectModeChanged: new Signal(),

		layoutChanged: new Signal(), // Layout signal

		contextChanged: new Signal(),

		CSGZoneAdded: new Signal(), // Sidebar.Properties signal

		viewportConfigChanged: new Signal(), // Viewport config signal

		CSGManagerStateChanged: new Signal() // State of CSGmanager changed
	};

	this.container = container;
	container.setAttribute('tabindex', '-1');
	this.container.focus();

	this.jsonVersion = JSON_VERSION;

	this.config = new Config();
	this.history = new _History(this);
	this.storage = new _Storage();
	this.strings = new Strings(this.config);
	this.unit = {
		name: '[cm]',
		multiplier: 1
	};

	this.loader = new Loader(this);

	this.camera = _DEFAULT_CAMERA.clone();

	this.scene = new THREE.Scene();
	this.scene.name = 'Figures';

	this.sceneHelpers = new THREE.Scene();

	this.materialsManager = new MaterialsManager(); // Material Manager
	this.zoneManager = new CSG.ZoneManager(this); // CSG Manager
	this.detectManager = new DetectManager(this); // Detect Manager

	this.beam = new Beam(this);
	this.sceneHelpers.add(this.beam);

	this.contextManager = new ContextManager(this); //Context Manager must be loaded after all scenes

	this.object = {};
	this.geometries = {};
	this.materials = {};
	this.textures = {};
	this.scripts = {};

	this.materialsRefCounter = new Map(); // tracks how often is a material used by a 3D object

	this.mixer = new THREE.AnimationMixer(this.scene);

	this.helpers = {};

	this.cameras = {};
	this.viewportCamera = this.camera;

	this.addCamera(this.camera);
}

Editor.prototype = {
	set selected(object) {
		Reflect.set(this.contextManager, 'selected', object);
	},
	get selected() {
		return Reflect.get(this.contextManager, 'selected');
	},
	setScene(scene) {
		this.scene.uuid = scene.uuid;
		this.scene.name = scene.name;

		this.scene.background = scene.background;
		this.scene.environment = scene.environment;

		this.scene.userData = JSON.parse(JSON.stringify(scene.userData));

		// avoid render per object

		this.signals.sceneGraphChanged.active = false;

		while (scene.children.length > 0) {
			this.addObject(scene.children[0]);
		}

		this.signals.sceneGraphChanged.active = true;
		this.signals.sceneGraphChanged.dispatch();
	},

	addObject(object, parent, index) {
		var scope = this;

		object.traverse(function (child) {
			if (child.geometry) scope.addGeometry(child.geometry);
			if (child.material) scope.addMaterial(child.material);

			scope.addCamera(child);
			scope.addHelper(child);
		});

		if (!parent) {
			this.scene.add(object);
		} else {
			parent.children.splice(index, 0, object);
			object.parent = parent;
		}

		this.signals.objectAdded.dispatch(object);
		this.signals.sceneGraphChanged.dispatch();
	},

	moveObject(object, parent, before) {
		if (!parent) {
			parent = this.scene;
		}

		parent.add(object);

		// sort children array

		if (before) {
			var index = parent.children.indexOf(before);
			parent.children.splice(index, 0, object);
			parent.children.pop();
		}

		this.signals.sceneGraphChanged.dispatch();
	},

	nameObject(object, name) {
		object.name = name;
		this.signals.sceneGraphChanged.dispatch();
	},

	removeObject(object) {
		if (object.parent === null) return; // avoid deleting the camera or scene

		var scope = this;

		object.traverse(function (child) {
			scope.removeCamera(child);
			scope.removeHelper(child);

			if (child.material) scope.removeMaterial(child.material);
		});

		object.parent.remove(object);
		this.signals.sceneGraphChanged.dispatch();
		this.signals.objectRemoved.dispatch(object);
	},

	addGeometry(geometry) {
		this.geometries[geometry.uuid] = geometry;
	},

	setGeometryName(geometry, name) {
		geometry.name = name;
		this.signals.sceneGraphChanged.dispatch();
	},

	addMaterial(material) {
		if (Array.isArray(material)) {
			for (var i = 0, l = material.length; i < l; i++) {
				this.addMaterialToRefCounter(material[i]);
			}
		} else {
			this.addMaterialToRefCounter(material);
		}

		this.signals.materialAdded.dispatch();
	},

	addMaterialToRefCounter(material) {
		var materialsRefCounter = this.materialsRefCounter;

		var count = materialsRefCounter.get(material);

		if (typeof count === 'undefined') {
			materialsRefCounter.set(material, 1);
			this.materials[material.uuid] = material;
		} else {
			count++;
			materialsRefCounter.set(material, count);
		}
	},

	removeMaterial(material) {
		if (Array.isArray(material)) {
			for (var i = 0, l = material.length; i < l; i++) {
				this.removeMaterialFromRefCounter(material[i]);
			}
		} else {
			this.removeMaterialFromRefCounter(material);
		}

		this.signals.materialRemoved.dispatch();
	},

	removeMaterialFromRefCounter(material) {
		var materialsRefCounter = this.materialsRefCounter;

		var count = materialsRefCounter.get(material);
		count--;

		if (count === 0) {
			materialsRefCounter.delete(material);
			delete this.materials[material.uuid];
		} else {
			materialsRefCounter.set(material, count);
		}
	},

	getMaterialById(id) {
		var material;
		var materials = Object.values(this.materials);

		for (var i = 0; i < materials.length; i++) {
			if (materials[i].id === id) {
				material = materials[i];
				break;
			}
		}

		return material;
	},

	setMaterialName(material, name) {
		material.name = name;
		this.signals.sceneGraphChanged.dispatch();
	},

	addTexture(texture) {
		this.textures[texture.uuid] = texture;
	},

	//

	addCamera(camera) {
		if (camera.isCamera) {
			this.cameras[camera.uuid] = camera;

			this.signals.cameraAdded.dispatch(camera);
		}
	},

	removeCamera(camera) {
		if (this.cameras[camera.uuid]) {
			delete this.cameras[camera.uuid];

			this.signals.cameraRemoved.dispatch(camera);
		}
	},

	//

	addHelper: (() => {
		var geometry = new THREE.SphereGeometry(2, 4, 2);
		var material = new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false });

		return (object, helper) => {
			if (!helper) {
				if (object.isCamera) {
					helper = new THREE.CameraHelper(object);
				} else if (object.isPointLight) {
					helper = new THREE.PointLightHelper(object, 1);
				} else if (object.isDirectionalLight) {
					helper = new THREE.DirectionalLightHelper(object, 1);
				} else if (object.isSpotLight) {
					helper = new THREE.SpotLightHelper(object);
				} else if (object.isHemisphereLight) {
					helper = new THREE.HemisphereLightHelper(object, 1);
				} else if (object.isSkinnedMesh) {
					helper = new THREE.SkeletonHelper(object.skeleton.bones[0]);
				} else {
					// No helper for this object type
					return;
				}

				var picker = new THREE.Mesh(geometry, material);
				picker.name = 'picker';
				picker.userData.object = object;
				helper.add(picker);
			}

			this.sceneHelpers.add(helper);
			this.helpers[object.id] = helper;

			this.signals.helperAdded.dispatch(helper);
		};
	})(),

	removeHelper(object) {
		if (this.helpers[object.id]) {
			var helper = this.helpers[object.id];
			helper.parent.remove(helper);

			delete this.helpers[object.id];

			this.signals.helperRemoved.dispatch(helper);
		}
	},

	//

	/**
	 * @deprecated scripts aren't needed for our app.
	 */
	addScript(object, script) {
		if (this.scripts[object.uuid] === undefined) {
			this.scripts[object.uuid] = [];
		}

		this.scripts[object.uuid].push(script);

		this.signals.scriptAdded.dispatch(script);
	},

	/**
	 * @deprecated scripts aren't needed for our app.
	 */
	removeScript(object, script) {
		if (this.scripts[object.uuid] === undefined) return;

		var index = this.scripts[object.uuid].indexOf(script);

		if (index !== -1) {
			this.scripts[object.uuid].splice(index, 1);
		}

		this.signals.scriptRemoved.dispatch(script);
	},

	getObjectMaterial(object, slot) {
		var material = object.material;

		if (Array.isArray(material) && Number.isInteger(slot)) {
			material = material[slot];
		}

		return material;
	},

	setObjectMaterial(object, slot, newMaterial) {
		if (Array.isArray(object.material) && Number.isInteger(slot)) {
			object.material[slot] = newMaterial;
		} else {
			object.material = newMaterial;
		}
	},

	setViewportCamera(uuid) {
		this.viewportCamera = this.cameras[uuid];
		this.signals.viewportCameraChanged.dispatch();
	},

	//

	select(object) {
		if (this.selected === object) return;
		var uuid = null;

		if (object !== null) {
			uuid = object.uuid;
		}

		this.selected = object;

		this.config.setKey('selected', uuid);

		if (!object || object.isObject3D) this.signals.objectSelected.dispatch(object);
		else this.signals.dataObjectSelected.dispatch(object);
	},

	selectById(id) {
		if (id === this.camera.id) {
			this.select(this.camera);
			return;
		}

		const objectCollections = [this.scene, this.zoneManager, this.beam, this.detectManager];

		const object =
			objectCollections.map(e => e.getObjectById(id)).find(e => typeof e !== 'undefined') ??
			null;

		this.select(object);
	},

	selectByUuid(uuid) {
		const objectCollections = [
			this.scene,
			this.zoneManager,
			this.beam,
			this.detectManager,
			this.detectManager.filterContainer
		];
		const object =
			objectCollections.find(e => e.uuid === uuid) ??
			objectCollections
				.map(e => e.getObjectByProperty('uuid', uuid))
				.find(e => typeof e !== 'undefined') ??
			null;

		this.select(object);
	},

	deselect() {
		this.select(null);
	},

	focus(object) {
		if (object) {
			this.signals.objectFocused.dispatch(object);
		}
	},

	focusById(id) {
		this.focus(this.scene.getObjectById(id));
	},

	clear() {
		this.history.clear();
		this.storage.clear();

		this.camera.copy(_DEFAULT_CAMERA);
		this.signals.cameraResetted.dispatch();

		this.scene.name = 'Figures';
		this.scene.userData = {};
		this.scene.background = null;
		this.scene.environment = null;

		var objects = this.scene.children;

		while (objects.length > 0) {
			this.removeObject(objects[0]);
		}

		this.zoneManager.reset();
		this.detectManager.reset();
		this.beam.reset();

		this.geometries = {};
		this.materials = {};
		this.textures = {};
		this.scripts = {};

		this.materialsRefCounter.clear();

		this.animations = {};
		this.mixer.stopAllAction();

		this.deselect();

		this.signals.editorCleared.dispatch();
	},

	//

	updateUserData() {
		this.scene.children.forEach(object => {
			object.userData = generateSimulationInfo(object);
		});
	},

	//

	async fromJSON(json) {
		const loader = new EditorObjectLoader(this);
		const camera = await loader.parseAsync(json.camera);

		this.camera.copy(camera);
		this.signals.cameraResetted.dispatch();

		this.history.fromJSON(json.history);
		this.scripts = json.scripts;

		this.setScene(await loader.parseAsync(json.scene));

		this.materialsManager.fromJSON(json.materialsManager);

		// CSGManager must be loaded after scene and simulation materials
		this.zoneManager.fromJSON(json.zoneManager); // CSGManager must be loaded in order not to lose reference in components

		this.detectManager.fromJSON(json.detectManager);

		this.beam.fromJSON(json.beam);

		this.signals.sceneGraphChanged.dispatch();
	},

	toJSON() {
		// scripts clean up

		var scene = this.scene;
		var scripts = this.scripts;

		for (var key in scripts) {
			var script = scripts[key];

			if (script.length === 0 || scene.getObjectByProperty('uuid', key) === undefined) {
				delete scripts[key];
			}
		}

		//

		return {
			metadata: {
				version: this.jsonVersion,
				type: 'Editor',
				generator: 'Editor.toJSON'
			},
			project: {
				shadows: this.config.getKey('project/renderer/shadows'),
				shadowType: this.config.getKey('project/renderer/shadowType'),
				physicallyCorrectLights: this.config.getKey(
					'project/renderer/physicallyCorrectLights'
				),
				toneMapping: this.config.getKey('project/renderer/toneMapping'),
				toneMappingExposure: this.config.getKey('project/renderer/toneMappingExposure')
			},
			camera: this.camera.toJSON(),
			scene: this.scene.toJSON(),
			scripts: this.scripts,
			history: this.history.toJSON(),
			zoneManager: this.zoneManager.toJSON(), // serialize CSGManager
			detectManager: this.detectManager.toJSON(), // serialize DetectManager;
			beam: this.beam.toJSON(),
			materialsManager: this.materialsManager.toJSON() // serialize MaterialManager
		};
	},

	objectByUuid(uuid) {
		return this.scene.getObjectByProperty('uuid', uuid, true);
	},

	execute(cmd, optionalName) {
		this.history.execute(cmd, optionalName);
	},

	undo() {
		this.history.undo();
	},

	redo() {
		this.history.redo();
	}
};
