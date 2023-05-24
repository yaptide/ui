import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { Editor } from '../../js/Editor';
import {
	SimulationElementManager,
	SimulationSceneContainer,
	SingletonContainer
} from '../Base/SimulationScene';
import { BeamModulator } from './BeamModulator';
import { CTCube } from './CtCube';

export class SpecialComponentManager
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
		this.editor = editor;
		this.CTCubeContainer = new SingletonContainer<CTCube>(editor, 'CT Cube', 'CTCube');
		this.modulatorContainer = new SingletonContainer<BeamModulator>(
			editor,
			'Beam Modulator',
			'BeamModulator'
		);
	}
	addCTCube(ctCube: CTCube) {
		this.CTCubeContainer.add(ctCube);
	}
	addModulator(modulator: BeamModulator) {
		this.modulatorContainer.add(modulator);
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
