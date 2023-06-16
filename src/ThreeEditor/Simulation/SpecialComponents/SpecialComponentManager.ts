import * as THREE from 'three';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneContainer, SingletonContainer } from '../Base/SimulationContainer';
import { BeamModulator, BeamModulatorJSON, isBeamModulator } from './BeamModulator';
import { CTCube, CTCubeJSON, isCTCube } from './CTCube';
import { SimulationElementManager } from '../Base/SimulationManager';
import { SimulationElementJSON } from '../Base/SimulationElement';
import { Signal } from 'signals';

type SpecialComponentManagerJSON = Omit<
	SimulationElementJSON & {
		CTCube?: CTCubeJSON;
		modulator?: BeamModulatorJSON;
		metadata: Record<string, string | number>;
	},
	never
>;

export class SpecialComponentManager
	extends THREE.Scene
	implements
		SimulationElementManager<'CTCube', CTCube>,
		SimulationElementManager<'beamModulator', BeamModulator>,
		SimulationPropertiesType
{
	/****************************Private****************************/
	private readonly metadata = {
		version: `0.10`, //update this to current YaptideEditor version when format changes
		type: 'Manager',
		generator: 'SpecialComponentManager.toJSON'
	} satisfies Record<string, string | number>;

	private editor: YaptideEditor;
	private signals: {
		objectSelected: Signal<THREE.Object3D>;
		sceneGraphChanged: Signal;
		materialChanged: Signal<THREE.Material>;
	};
	private managerType: 'SpecialComponentManager' = 'SpecialComponentManager';

	private _name: string;
	/***************************************************************/

	/*******************SimulationPropertiesType********************/
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly flattenOnOutliner = true;
	readonly isSimulationElement = true;
	readonly isSpecialComponentsManager: true = true;
	/***************************************************************/

	/*************************CTCubeMethods*************************/
	CTCubeContainer: SimulationSceneContainer<CTCube>;
	get CTCubes() {
		return this.CTCubeContainer.children;
	}

	addCTCube(ctCube: CTCube) {
		this.CTCubeContainer.add(ctCube);
		this.editor.select(ctCube);
	}
	removeCTCube(ctCube: CTCube) {
		this.CTCubeContainer.remove(ctCube);
	}
	createCTCube() {
		const ctCube = new CTCube(this.editor);
		this.addCTCube(ctCube);
		return ctCube;
	}
	getCTCubeByUuid(uuid: string) {
		return this.CTCubeContainer.children.find(ctCube => ctCube.uuid === uuid) ?? null;
	}
	getCTCubeByName(name: string) {
		return this.CTCubeContainer.children.find(ctCube => ctCube.name === name) ?? null;
	}
	private hasUsefulGeometry(object: THREE.Object3D): object is BeamModulator {
		return Boolean(
			isBeamModulator(object) &&
				this.editor.selected === object &&
				object.geometry &&
				object.geometry.boundingSphere &&
				object.geometry.boundingSphere.radius > 0
		);
	}

	private _detectWireMaterial = new THREE.MeshBasicMaterial({
		color: 0x000000,
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0.5,
		wireframe: true
	});
	/***************************************************************/

	/***********************ModulatorMethods************************/
	beamModulatorContainer: SimulationSceneContainer<BeamModulator>;
	beamModulatorHelper: THREE.Mesh;
	get beamModulators() {
		return this.beamModulatorContainer.children;
	}

	addBeamModulator(modulator: BeamModulator) {
		this.beamModulatorContainer.add(modulator);
		this.editor.select(modulator);
	}
	removeBeamModulator(modulator: BeamModulator) {
		this.beamModulatorContainer.remove(modulator);
	}
	createBeamModulator() {
		const modulator = new BeamModulator(this.editor);
		this.addBeamModulator(modulator);
		return modulator;
	}
	getBeamModulatorByUuid(uuid: string) {
		return (
			this.beamModulatorContainer.children.find(modulator => modulator.uuid === uuid) ?? null
		);
	}
	getBeamModulatorByName(name: string) {
		return (
			this.beamModulatorContainer.children.find(modulator => modulator.name === name) ?? null
		);
	}
	/***************************************************************/

	constructor(editor: YaptideEditor) {
		super();

		this.editor = editor;
		this.name = this._name = 'Special Components';
		this.CTCubeContainer = new SingletonContainer<CTCube>(
			editor,
			'CT Cube Singleton',
			'CTCube',
			json => new CTCube(editor).fromJSON(json)
		);
		this.beamModulatorContainer = new SingletonContainer<BeamModulator>(
			editor,
			'Beam Modulator Singleton',
			'BeamModulator',
			json => new BeamModulator(editor).fromJSON(json)
		);
		this.beamModulatorHelper = new THREE.Mesh(undefined, this._detectWireMaterial);
		this.beamModulatorHelper.visible = false;

		this.add(this.beamModulatorHelper);

		this.add(this.CTCubeContainer);
		this.add(this.beamModulatorContainer);

		this.signals = editor.signals;
		this.signals.objectSelected.add(this.onObjectSelected.bind(this));
		this.signals.materialChanged.add(this.onMaterialChanged.bind(this));
	}

	private onObjectSelected = (object: THREE.Object3D) => {
		this.beamModulatorHelper.geometry.dispose();
		this.beamModulatorHelper.geometry = new THREE.BufferGeometry();
		this.beamModulatorHelper.visible = false;

		if (!this.hasUsefulGeometry(object)) return;
		this.beamModulatorHelper.position.copy(object.position);
		this._detectWireMaterial.color.copy(object.material.color);
		this.beamModulatorHelper.geometry = object.geometry.clone();
		this.beamModulatorHelper.visible = object.visible;

		this.signals.sceneGraphChanged.dispatch();
	};

	private onMaterialChanged() {
		if (isBeamModulator(this.editor.selected)) {
			this._detectWireMaterial.color.copy(this.editor.selected.material.color);
		}
	}

	copy(source: this, recursive?: boolean | undefined) {
		super.copy(source, recursive);
		return this.fromJSON(source.toJSON());
	}

	reset(): this {
		this.name = this._name;
		this.CTCubeContainer.reset();
		this.beamModulatorContainer.reset();

		this.beamModulatorHelper.geometry.dispose();

		return this;
	}

	toJSON(): SpecialComponentManagerJSON {
		const { uuid, name, managerType: type, metadata } = this;
		const [CTCube] = this.CTCubeContainer.toJSON();
		const [modulator] = this.beamModulatorContainer.toJSON();
		return {
			CTCube,
			modulator,
			uuid,
			name,
			type,
			metadata
		};
	}
	fromJSON(json: SpecialComponentManagerJSON) {
		const {
			metadata: { version }
		} = this;
		const { uuid, name, metadata, CTCube, modulator } = json;
		if (!metadata || metadata.version !== version)
			console.warn(
				`SpecialComponentManager version mismatch: ${metadata?.version} !== ${version}`
			);

		this.uuid = uuid;
		this.name = name;
		this.CTCubeContainer.fromJSON(CTCube ? [CTCube] : []);
		this.beamModulatorContainer.fromJSON(modulator ? [modulator] : []);
		return this;
	}
}

export function isSpecialComponent(object: unknown): object is CTCube | BeamModulator {
	return isCTCube(object) || isBeamModulator(object);
}
