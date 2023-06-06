import * as THREE from 'three';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationPoints, SimulationPointsJSON } from '../Base/SimulationPoints';

type ModulatorParameters = {};

export type BeamModulatorJSON = Omit<SimulationPointsJSON & ModulatorParameters, never>;

export class BeamModulator extends SimulationPoints {
	pointsHelper: THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
	reset(): void {
		throw new Error('Method not implemented.');
	}
	readonly isBeamModulator: true = true;
	constructor(editor: YaptideEditor) {
		super(
			editor,
			'Beam Modulator',
			'BeamModulator',
			new THREE.PointsMaterial({
				color: editor.materialManager.defaultMaterial.color.clone(),
				size: 0.2
			})
		);
		this.geometry = new THREE.BufferGeometry();
		this.pointsHelper = new THREE.Mesh(
			new THREE.BufferGeometry(),
			new THREE.MeshBasicMaterial({
				color: 0x000000,
				side: THREE.DoubleSide,
				transparent: true,
				opacity: 0.5,
				wireframe: true
			})
		);
	}
}

export function isBeamModulator(object: unknown): object is BeamModulator {
	return object instanceof BeamModulator;
}
