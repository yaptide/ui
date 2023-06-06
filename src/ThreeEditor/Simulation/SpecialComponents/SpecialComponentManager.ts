import * as THREE from 'three';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneContainer, SingletonContainer } from '../Base/SimulationContainer';
import { BeamModulator, isBeamModulator } from './BeamModulator';
import { CTCube, isCTCube } from './CTCube';
import { SimulationElementManager } from '../Base/SimulationManager';
import { SimulationMeshJSON } from '../Base/SimulationMesh';

type SpecialComponentManagerJSON = {
	CTCube: ReturnType<SimulationSceneContainer<CTCube>['toJSON']>;
	modulator: ReturnType<SimulationSceneContainer<BeamModulator>['toJSON']>;
};

export class SpecialComponentManager
	extends THREE.Scene
	implements
		SimulationElementManager<'CTCube', CTCube>,
		SimulationElementManager<'beamModulator', BeamModulator>,
		SimulationPropertiesType
{
	readonly isSpecialComponentsManager: true = true;
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly notHidable = true;
	readonly flattenOnOutliner = true;
	editor: YaptideEditor;
	CTCubeContainer: SimulationSceneContainer<CTCube>;
	beamModulatorContainer: SimulationSceneContainer<BeamModulator>;
	get CTCubes() {
		return this.CTCubeContainer.children;
	}
	get beamModulators() {
		return this.beamModulatorContainer.children;
	}

	_name: string;
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
		this.add(this.CTCubeContainer);
		this.add(this.beamModulatorContainer);
	}
	reset(): this {
		this.name = this._name;
		this.CTCubeContainer.reset();
		this.beamModulatorContainer.reset();
		return this;
	}
	addCTCube(ctCube: CTCube) {
		this.CTCubeContainer.add(ctCube);
		this.editor.select(ctCube);
	}
	addBeamModulator(modulator: BeamModulator) {
		this.beamModulatorContainer.add(modulator);
		this.editor.select(modulator);
	}
	removeCTCube(ctCube: CTCube) {
		this.CTCubeContainer.remove(ctCube);
	}
	removeBeamModulator(modulator: BeamModulator) {
		this.beamModulatorContainer.remove(modulator);
	}
	createCTCube() {
		const ctCube = new CTCube(this.editor);
		this.addCTCube(ctCube);
		return ctCube;
	}
	createBeamModulator() {
		const modulator = new BeamModulator(this.editor);
		this.addBeamModulator(modulator);
		return modulator;
	}
	getCTCubeByUuid(uuid: string) {
		return this.CTCubeContainer.children.find(ctCube => ctCube.uuid === uuid) ?? null;
	}
	getBeamModulatorByUuid(uuid: string) {
		return (
			this.beamModulatorContainer.children.find(modulator => modulator.uuid === uuid) ?? null
		);
	}
	getCTCubeByName(name: string) {
		return this.CTCubeContainer.children.find(ctCube => ctCube.name === name) ?? null;
	}
	getBeamModulatorByName(name: string) {
		return (
			this.beamModulatorContainer.children.find(modulator => modulator.name === name) ?? null
		);
	}
	toJSON() {
		return {
			CTCube: this.CTCubeContainer.toJSON(),
			modulator: this.beamModulatorContainer.toJSON()
		};
	}
	fromJSON({ CTCube, modulator }: SpecialComponentManagerJSON) {
		this.CTCubeContainer.fromJSON(CTCube);
		this.beamModulatorContainer.fromJSON(modulator);
	}
}

export function isSpecialComponent(object: unknown): object is CTCube | BeamModulator {
	return isCTCube(object) || isBeamModulator(object);
}
