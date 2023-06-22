import * as Comlink from 'comlink';
import * as THREE from 'three';

import { DEPLOYMENT } from '../../config/ConfigService';

export class ZoneWorker {
	readonly isCSGWorker: true = true;

	static async parse(json: string) {
		if (DEPLOYMENT === 'dev')
			console.log(
				'[' + /\d\d\:\d\d\:\d\d/.exec(new Date().toString())![0] + ']', // eslint-disable-line
				'CSGWorker',
				await new THREE.ObjectLoader().parseAsync(JSON.parse(json))
			);
		return json;
	}
}

Comlink.expose(new ZoneWorker());
