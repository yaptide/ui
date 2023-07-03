import hash from 'object-hash';
import Signal from 'signals';
import * as THREE from 'three';

import { DetectorManager } from '../Simulation/Detectors/DetectorManager';
import { FigureManager } from '../Simulation/Figures/FigureManager';
import { MaterialManager } from '../Simulation/Materials/MaterialManager';
import { Beam } from '../Simulation/Physics/Beam';
import { Physics } from '../Simulation/Physics/Physics';
import { ScoringManager } from '../Simulation/Scoring/ScoringManager';
import { SpecialComponentManager } from '../Simulation/SpecialComponents/SpecialComponentManager';
import { ZoneManager } from '../Simulation/Zones/ZoneManager';
import { Config } from './Config.js';
import { ContextManager } from './EditorContext';
import { History as _History } from './History.js';
import { Loader } from './Loader.js';
import { Storage as _Storage } from './Storage.js';

const _DEFAULT_CAMERA = new THREE.PerspectiveCamera(50, 1, 0.01, 1000);
_DEFAULT_CAMERA.name = 'Camera';
_DEFAULT_CAMERA.position.set(0, 5, 10);
_DEFAULT_CAMERA.lookAt(new THREE.Vector3());

export const JSON_VERSION = `0.10`;

export function YaptideEditor(container) {
	this.signals = {
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
		projectChanged: new Signal(),

		cameraChanged: new Signal(),
		cameraResetted: new Signal(),

		geometryChanged: new Signal(),

		objectSelected: new Signal(),
		objectFocused: new Signal(),

		objectAdded: new Signal(),
		objectChanged: new Signal(),
		objectRemoved: new Signal(),

		figureAdded: new Signal(),
		figureChanged: new Signal(),
		figureRemoved: new Signal(),

		//YAPTIDE zones
		zoneAdded: new Signal(),
		zoneChanged: new Signal(),
		zoneGeometryChanged: new Signal(),
		zoneEmpty: new Signal(),
		zoneRemoved: new Signal(),
		zoneTypeChanged: new Signal(),

		//YAPTIDE detect
		detectGeometryAdded: new Signal(),
		detectGeometryRemoved: new Signal(),
		detectGeometryChanged: new Signal(),
		detectTypeChanged: new Signal(),

		detectFilterAdded: new Signal(),
		detectFilterRemoved: new Signal(),
		detectFilterChanged: new Signal(),

		scoringQuantityChanged: new Signal(),

		cameraAdded: new Signal(),
		cameraRemoved: new Signal(),

		helperAdded: new Signal(),
		helperRemoved: new Signal(),

		materialAdded: new Signal(),
		materialChanged: new Signal(),
		materialRemoved: new Signal(),

		windowResize: new Signal(),

		showGridChanged: new Signal(),
		showHelpersChanged: new Signal(),

		/**
		 * @deprecated
		 * ViewportManager signal
		 */
		sceneRendered: new Signal(),

		/**
		 * @deprecated
		 * Viewport signal
		 */
		refreshSidebarObject3D: new Signal(),

		/**
		 * History -> EditorAppBar
		 */
		historyChanged: new Signal(),

		/**
		 * Editor -> ViewportManager
		 */
		viewportCameraChanged: new Signal(),

		/**
		 * Editor -> SceneEditor
		 * Editor -> EditorAppBar
		 */
		titleChanged: new Signal(),

		/**
		 * EditorMenu -> ViewportManager
		 */
		layoutChanged: new Signal(),

		/**
		 * EditorContext -><-
		 * EditorContext -> EditorSidebar
		 * EditorContext -> Viewport
		 * EditorContext -> ViewportManager
		 */
		contextChanged: new Signal(),

		/**
		 * WorldZone -> Viewport
		 */
		autocalculateChanged: new Signal(),

		/**
		 * ViewportClippedViewCSG -> ViewportManager
		 */
		viewportConfigChanged: new Signal(),

		/**
		 * useKeyboardEditorControls -> SidebarTreeItem
		 */
		requestRenameAction: new Signal(),

		/**
		 * @deprecated
		 * YAPTIDE signals
		 */
		selectModeChanged: new Signal(),

		/**
		 * @deprecated
		 * State of CSGmanager changed
		 */
		ZoneManagerStateChanged: new Signal(),

		/**
		 * @deprecated
		 * Sidebar.Properties signal
		 */
		CSGZoneAdded: new Signal(),

		/**
		 * @deprecated
		 * Menubar.Examples signal
		 */
		exampleLoaded: new Signal(),

		/**
		 * @deprecated
		 * ViewportManager signal
		 */
		animationStopped: new Signal()
	};

	this._results = null;

	this.viewManager = null;

	this.container = container;
	container.setAttribute('tabindex', '-1');
	this.container.focus();

	this.jsonVersion = JSON_VERSION;

	this.config = new Config();
	this.config.addListener('project/title', title => {
		this.signals.titleChanged.dispatch(title);
	});
	this.history = new _History(this);
	this.storage = new _Storage();
	this.unit = {
		name: 'cm',
		multiplier: 1
	};

	/**
	 * @property @deprecated Use DataLoaderService and YaptideEditor.handleJSON instead
	 */
	this.loader = new Loader(this);

	this.camera = _DEFAULT_CAMERA.clone();

	this.figureManager = new FigureManager(this);

	this.sceneHelpers = new THREE.Scene();

	this.materialManager = new MaterialManager(this); // Material Manager
	this.zoneManager = new ZoneManager(this); // Zone Manager
	this.detectorManager = new DetectorManager(this); // Detect Manager
	this.scoringManager = new ScoringManager(this); // Scoring Manager
	this.specialComponentsManager = new SpecialComponentManager(this); // Special Components Manager

	this.beam = new Beam(this);
	this.physic = new Physics();
	this.sceneHelpers.add(this.beam);

	this.contextManager = new ContextManager(this); //Context Manager must be loaded after all scenes

	this.object = {};
	this.geometries = {};
	this.materials = {};
	this.textures = {};
	this.scripts = {};

	this.materialsRefCounter = new Map(); // tracks how often is a material used by a 3D object

	this.mixer = new THREE.AnimationMixer(this.figureManager);

	this.helpers = {};

	this.cameras = {};
	this.viewportCamera = this.camera;

	this.addCamera(this.camera);

	this.searchableObjectCollections = [
		this.figureManager,
		this.zoneManager,
		this.beam,
		this.detectorManager,
		this.scoringManager,
		this.specialComponentsManager
	];
}

YaptideEditor.prototype = {
	setResults(results) {
		this._results = results;
	},
	getResults() {
		return this._results;
	},
	set selected(object) {
		Reflect.set(this.contextManager, 'selected', object);
	},
	get selected() {
		return Reflect.get(this.contextManager, 'selected');
	},
	/**
	 * @deprecated
	 */
	setScene(scene) {
		this.figureManager.uuid = scene.uuid;
		this.figureManager.name = scene.name;

		this.figureManager.background = scene.background;
		this.figureManager.environment = scene.environment;

		this.figureManager.userData = JSON.parse(JSON.stringify(scene.userData));

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
			this.figureManager.add(object);
		} else {
			parent.children.splice(index, 0, object);
			object.parent = parent;
		}

		this.signals.objectAdded.dispatch(object);
		this.signals.sceneGraphChanged.dispatch();
	},

	moveObject(object, parent, before) {
		if (!parent) {
			parent = this.figureManager;
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
		let uuid = null;

		if (object !== null) {
			uuid = object.uuid;
		}

		this.selected = object;

		this.config.setKey('selected', uuid);

		this.signals.objectSelected.dispatch(this.selected);
	},

	getObjectByName(name) {
		const object = this.searchableObjectCollections
			.map(e => e.getObjectByName(name))
			.find(e => typeof e !== 'undefined');

		return object;
	},

	getObjectById(id) {
		const object =
			this.searchableObjectCollections
				.map(e => e.getObjectById(id))
				.find(e => typeof e !== 'undefined') ?? null;
		return object;
	},

	selectById(id) {
		const object =
			this.searchableObjectCollections
				.map(e => e.getObjectById(id))
				.find(e => typeof e !== 'undefined') ?? null;

		this.select(object);
	},

	selectByUuid(uuid) {
		const object =
			this.searchableObjectCollections
				.map(e => e.getObjectByProperty('uuid', uuid))
				.find(e => typeof e !== 'undefined') ?? null;

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
		this.focus(this.figureManager.getObjectById(id));
	},

	resetCamera() {
		this.signals.editorCleared.dispatch();
	},

	clear() {
		this.history.clear();
		this.storage.clear();
		this.results = null;

		this.camera.copy(_DEFAULT_CAMERA);
		this.signals.cameraChanged.dispatch();

		this.figureManager.reset();
		this.materialManager.reset();
		this.zoneManager.reset();
		this.detectorManager.reset();
		this.scoringManager.reset();
		this.specialComponentsManager.reset();
		this.beam.reset();
		this.physic.reset();

		this.geometries = {};
		this.materials = {};
		this.textures = {};

		this.materialsRefCounter.clear();

		this.animations = {};
		this.mixer.stopAllAction();

		this.deselect();
		this.contextManager.reset();

		this.signals.editorCleared.dispatch();
	},

	//

	async fromJSON(json) {
		const {
			project,
			materialManager,
			figureManager,
			zoneManager,
			detectorManager,
			scoringManager,
			specialComponentsManager,
			beam,
			physic
		} = json;
		try {
			if (project) {
				this.config.setKey('project/title', project.title ?? '');
				this.config.setKey('project/description', project.description ?? '');
			} else
				console.warn('Project info was not found in JSON data. Skipping part 1 out of 11');

			if (project && project.viewManager)
				this.viewManager.fromConfigurationJson(project.viewManager);
			else console.warn('View Manager was not found in JSON data. Skipping part 2 out of 11');

			if (project && project.history) this.history.fromJSON(project.history);
			else console.warn('History was not found in JSON data. Skipping part 3 out of 11');

			if (materialManager) this.materialManager.fromJSON(materialManager);
			else
				throw new Error(
					'Material Manager was not found in JSON data. Aborting load on part 4 out of 11'
				);
			if (figureManager) this.figureManager.fromJSON(figureManager);
			else
				throw new Error(
					'Figure Manager was not found in JSON data. Aborting load on part 5 out of 11'
				);

			// CSGManager must be loaded after scene and simulation materials
			if (zoneManager) this.zoneManager.fromJSON(zoneManager);
			else
				throw new Error(
					'Zone Manager was not found in JSON data. Aborting load on part 6 out of 11'
				);

			if (detectorManager) this.detectorManager.fromJSON(detectorManager);
			else
				throw new Error(
					'Detector Manager was not found in JSON data. Aborting load on part 7 out of 11'
				);
			if (specialComponentsManager)
				this.specialComponentsManager.fromJSON(specialComponentsManager);
			else
				console.warn(
					'Special Components Manager was not found in JSON data. Skipping part 8 out of 11'
				);

			if (scoringManager) this.scoringManager.fromJSON(scoringManager);
			else
				console.warn(
					'Scoring Manager was not found in JSON data. Skipping part 9 out of 11'
				);

			if (beam) this.beam.fromJSON(beam);
			else console.warn('Beam was not found in JSON data. Skipping part 10 out of 11');

			if (physic) this.physic.fromJSON(physic);
			else console.warn('Physic was not found in JSON data. Skipping part 11 out of 11');

			this.signals.cameraResetted.dispatch();
			this.signals.sceneGraphChanged.dispatch();
			this.signals.projectChanged.dispatch();
		} catch (e) {
			console.error(e);
			this.clear();
		}
	},
	toJSON() {
		// scripts clean up

		var scene = this.figureManager;
		var scripts = this.scripts;

		for (var key in scripts) {
			var script = scripts[key];

			if (script.length === 0 || scene.getObjectByProperty('uuid', key) === undefined) {
				delete scripts[key];
			}
		}

		//

		const jsonEditor = {
			metadata: {
				version: this.jsonVersion,
				type: 'Editor',
				generator: 'YaptideEditor.toJSON'
			},
			project: {
				title: this.config.getKey('project/title'),
				description: this.config.getKey('project/description'),
				viewManager: this.viewManager.configurationToJson(), // serialize ViewManager
				history: this.history.toJSON() // serialize History
			},
			figureManager: this.figureManager.toJSON(),
			zoneManager: this.zoneManager.toJSON(), // serialize ZoneManager
			detectorManager: this.detectorManager.toJSON(), // serialize DetectorManager;
			specialComponentsManager: this.specialComponentsManager.toJSON(), // serialize SpecialComponentsManager
			materialManager: this.materialManager.toJSON(), // serialize MaterialManager
			scoringManager: this.scoringManager.toJSON(), // serialize ScoringManager

			beam: this.beam.toJSON(),
			physic: this.physic.toJSON()
		};

		const hashJsonEditor = hash(jsonEditor);

		return { ...jsonEditor, hash: hashJsonEditor };
	},

	objectByUuid(uuid) {
		return this.figureManager.getObjectByProperty('uuid', uuid, true);
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
