import * as Comlink from 'comlink';
import * as THREE from 'three';

export interface ICSGWorker {
    parse: (object: string) => unknown;
}

class CSGWorker implements ICSGWorker {
    async parse(json: string) {
        console.log("CSGWorker", await new THREE.ObjectLoader().parseAsync(JSON.parse(json)));
        return json;
    }
}

Comlink.expose(new CSGWorker());