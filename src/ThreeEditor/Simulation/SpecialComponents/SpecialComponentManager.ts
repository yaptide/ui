import * as THREE from 'three';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { Editor } from '../../js/Editor';
import { SimulationSceneContainer, SingletonContainer } from '../Base/SimulationContainer';
import { BeamModulator, isBeamModulator } from './BeamModulator';
import { CTCube, isCTCube } from './CTCube';
import { SimulationElementManager } from '../Base/SimulationManager';

export class SpecialComponentManager
	extends THREE.Scene
	implements
		SimulationElementManager<'CTCube', CTCube>,
		SimulationElementManager<'modulator', BeamModulator>,
		SimulationPropertiesType
{
	readonly isSpecialComponentsManager: true = true;
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly notHidable = true;
	editor: Editor;
	CTCubeContainer: SimulationSceneContainer<CTCube>;
	modulatorContainer: SimulationSceneContainer<BeamModulator>;
	constructor(editor: Editor) {
		super();

		this.editor = editor;
		this.name = 'Special Components';
		this.CTCubeContainer = new SingletonContainer<CTCube>(editor, 'CT Cube', 'CTCube');
		this.modulatorContainer = new SingletonContainer<BeamModulator>(
			editor,
			'Beam Modulator',
			'BeamModulator'
		);
		this.add(this.CTCubeContainer);
		this.add(this.modulatorContainer);
	}
	addCTCube(ctCube: CTCube) {
		this.CTCubeContainer.add(ctCube);
		this.editor.select(ctCube);
	}
	addModulator(modulator: BeamModulator) {
		this.modulatorContainer.add(modulator);
		this.editor.select(modulator);
	}
	removeCTCube(ctCube: CTCube) {
		this.CTCubeContainer.remove(ctCube);
	}
	removeModulator(modulator: BeamModulator) {
		this.modulatorContainer.remove(modulator);
	}
	createCTCube() {
		const ctCube = new CTCube(this.editor);
		this.addCTCube(ctCube);
		return ctCube;
	}
	createModulator() {
		const modulator = new BeamModulator(this.editor);
		this.addModulator(modulator);
		return modulator;
	}
	getCTCubeByUuid(uuid: string) {
		return this.CTCubeContainer.children.find(ctCube => ctCube.uuid === uuid) ?? null;
	}
	getModulatorByUuid(uuid: string) {
		return this.modulatorContainer.children.find(modulator => modulator.uuid === uuid) ?? null;
	}
	getCTCubeByName(name: string) {
		return this.CTCubeContainer.children.find(ctCube => ctCube.name === name) ?? null;
	}
	getModulatorByName(name: string) {
		return this.modulatorContainer.children.find(modulator => modulator.name === name) ?? null;
	}
	toJSON() {
		return {
			CTCube: this.CTCubeContainer.toJSON(),
			modulator: this.modulatorContainer.toJSON()
		};
	}
}

export function isSpecialComponent(object: unknown): object is CTCube | BeamModulator {
	return isCTCube(object) || isBeamModulator(object);
}
