import * as THREE from 'three';

export default class SimulationMaterial extends THREE.MeshPhongMaterial {
	simulationData: { id: string; name: string };
	readonly isSimulationMaterial: true = true;
	constructor(data: { id: string; name: string }, args: Record<string, unknown>) {
		super({
			name: data.name,
			flatShading: true,
			side: THREE.DoubleSide,
			transparent: true,
			color: new THREE.Color(0xff3d3d),
			...args
		});
		this.simulationData = data;
	}
}
