import * as Comlink from 'comlink';
import * as THREE from 'three';

export class ZoneWorker {
	readonly isCSGWorker: true = true;
	async parse(json: string) {
		console.log('CSGWorker', await new THREE.ObjectLoader().parseAsync(JSON.parse(json)));
		return json;
	}
}

Comlink.expose(new ZoneWorker());
