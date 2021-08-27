import { CSG } from "./csg-lib";

export function fromMesh(emptyMesh: Mesh<BufferGeometry, Material | Material[]>): CSG {
    throw new Error("Function not implemented.");
}


export function toMesh(bspResult: CSG, matrix: Matrix4, material?: THREE.Material | THREE.Material[]): THREE.Mesh {
    throw new Error('Function not implemented.');
}


export type CSGOperationType = 'union' | 'subtract' | 'intersect';
