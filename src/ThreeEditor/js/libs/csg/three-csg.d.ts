import { Mesh, BufferGeometry, Material, Matrix4 } from 'three';
import { CSG as LibCSG } from './csg-lib';

export type CSGOperationType = 'union' | 'subtract' | 'intersect';

export default class CSG extends LibCSG {
	static toGeometry(unionsResultBsp: CSG, matrix: Matrix4): THREE.BufferGeometry {
		throw new Error('Method not implemented.');
	}
	static fromMesh(emptyMesh: Mesh<BufferGeometry, Material | Material[]>): CSG {
		throw new Error('Function not implemented.');
	}

	static toMesh(
		bspResult: CSG,
		matrix: Matrix4,
		material?: THREE.Material | THREE.Material[]
	): THREE.Mesh {
		throw new Error('Function not implemented.');
	}
}
