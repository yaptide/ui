import THREE, { MathUtils } from "three";
import CSG from "../js/libs/csg/three-csg";

type CSGOperationMode = 'left-subtract' | 'intersect' | 'right-subtract';

interface CSGOperation {
    object: THREE.Mesh;
    mode: CSGOperationMode;
}

class CSGZone {
    uuid: string;
    name: string;
    material: THREE.Material;
    unionOperations: CSGOperation[][];

    constructor(name?: string, material?: THREE.Material, unionOperations?: CSGOperation[][]) {
        this.uuid = MathUtils.generateUUID();
        this.name = name || 'CSGZone';
        this.material = material || new THREE.MeshNormalMaterial();
        this.unionOperations = unionOperations || [[]];
    }

    buildMesh() {

        let emptyMesh = new THREE.Mesh();
        let unionsResultBsp = CSG.fromMesh(emptyMesh);

        for (let i = 0; i < this.unionOperations.length; i++) {
            const operations = this.unionOperations[i];

            let operationsResultBsp = new CSG();

            for (let index = 0; index < operations.length; index++) {
                const operation = operations[index];
                let lastBsp = operationsResultBsp;

                operation.object.updateMatrix();

                let objectBsp = CSG.fromMesh(operation.object);

                let handleMode = {
                    'left-subtract': () => lastBsp.subtract(objectBsp),
                    'intersect': () => lastBsp.intersect(objectBsp),
                    'right-subtract': () => objectBsp.subtract(lastBsp),
                }

                operationsResultBsp = handleMode[operation.mode]();
            }

            unionsResultBsp.union(operationsResultBsp);
        }


        let meshResult = CSG.toMesh(unionsResultBsp, emptyMesh.matrix);
        meshResult.name = this.name;
        meshResult.material = this.material;

        return meshResult;
    }
}

class CSGManager {



}

export { CSGManager }