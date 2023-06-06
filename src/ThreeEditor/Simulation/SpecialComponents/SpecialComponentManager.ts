import * as THREE from 'three';
import { SimulationPropertiesType } from '../../../types/SimulationProperties';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationSceneContainer, SingletonContainer } from '../Base/SimulationContainer';
import { BeamModulator, BeamModulatorJSON, isBeamModulator } from './BeamModulator';
import { CTCube, CTCubeJSON, isCTCube } from './CTCube';
import { SimulationElementManager } from '../Base/SimulationManager';
import { SimulationElementJSON } from '../Base/SimulationElement';

type SpecialComponentManagerJSON = Omit<
	SimulationElementJSON & {
		CTCube: CTCubeJSON;
		modulator: BeamModulatorJSON;
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
		version: 0.9, //update this to current YaptideEditor version when format changes
		type: 'Manager',
		generator: 'SpecialComponentManager.toJSON'
	} satisfies Record<string, string | number>;

	private editor: YaptideEditor;
	private signals: {};
	private managerType: 'SpecialComponentManager' = 'SpecialComponentManager';

	private _name: string;
	/***************************************************************/

	/*******************SimulationPropertiesType********************/
	readonly notRemovable: boolean = true;
	readonly notMovable = true;
	readonly notRotatable = true;
	readonly notScalable = true;
	readonly flattenOnOutliner = true;
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
	/***************************************************************/

	/***********************ModulatorMethods************************/
	beamModulatorContainer: SimulationSceneContainer<BeamModulator>;
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
		this.add(this.CTCubeContainer);
		this.add(this.beamModulatorContainer);

		this.signals = editor.signals;
	}

	copy(source: this, recursive?: boolean | undefined) {
		super.copy(source, recursive);
		return this.fromJSON(source.toJSON());
	}

	reset(): this {
		this.name = this._name;
		this.CTCubeContainer.reset();
		this.beamModulatorContainer.reset();

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
		this.CTCubeContainer.fromJSON([CTCube]);
		this.beamModulatorContainer.fromJSON([modulator]);
		return this;
	}
}

export function isSpecialComponent(object: unknown): object is CTCube | BeamModulator {
	return isCTCube(object) || isBeamModulator(object);
}
