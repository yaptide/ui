import * as Comlink from 'comlink';
import * as THREE from 'three';

export interface IZoneWorker {
	parse: (json: string) => unknown;
}

class ZoneWorker implements IZoneWorker {
	readonly isCSGWorker: true = true;
	async parse(json: string) {
		console.log('CSGWorker', await new THREE.ObjectLoader().parseAsync(JSON.parse(json)));
		return json;
	}
}

Comlink.expose(new ZoneWorker());
