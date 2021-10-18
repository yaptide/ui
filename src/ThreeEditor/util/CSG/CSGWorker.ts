import * as Comlink from 'comlink';
import * as THREE from 'three';

export interface ICSGWorker {
    parse: (object: string) => unknown;
}

class CSGWorker implements ICSGWorker {
    async parse(object: string) {
        console.log("CSGWorker", await new THREE.ObjectLoader().parseAsync(JSON.parse(object)));
        return object;
    }
}

Comlink.expose(new CSGWorker());