import { Mesh, BufferGeometry, Material } from "three";
import { CSG as LibCSG } from "./csg-lib";

export type CSGOperationType = 'union' | 'subtract' | 'intersect';

export default class CSG extends LibCSG {   
    static fromMesh(emptyMesh: Mesh<BufferGeometry, Material | Material[]>): CSG {
        throw new Error("Function not implemented.");
    }

    static toMesh(bspResult: CSG, matrix: Matrix4, material?: THREE.Material | THREE.Material[]): THREE.Mesh {
        throw new Error('Function not implemented.');
    }
}
