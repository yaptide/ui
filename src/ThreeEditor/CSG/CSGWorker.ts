import * as Comlink from 'comlink';
import * as THREE from 'three';

import { devLog } from '../../util/devLog';

export class ZoneWorker {
	readonly isCSGWorker: true = true;

	static async parse(json: string) {
		devLog('CSGWorker.parse', await new THREE.ObjectLoader().parseAsync(JSON.parse(json)));

		return json;
	}
}

Comlink.expose(new ZoneWorker());
