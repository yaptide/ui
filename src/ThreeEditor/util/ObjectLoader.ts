import { Object3D, ObjectLoader } from 'three';
import { BoxMesh, CylinderMesh, SphereMesh } from './BasicMeshes';

export class EditorObjectLoader extends ObjectLoader {
	parseObject<T extends Object3D<THREE.Event>>(
		data: any,
		geometries: any[],
		materials: THREE.Material[],
		animations: THREE.AnimationClip[]
	): T {
		const geometry = geometries[data.geometry];
		const material = materials[data.material];

		let object = super.parseObject<T>(data, geometries, materials, animations);
		let editorObject;
		switch (data.type) {
			case 'SphereMesh':
				editorObject = new SphereMesh();
				break;
			case 'BoxMesh':
				editorObject = new BoxMesh();
				break;
			case 'CylinderMesh':
				editorObject = new CylinderMesh();
				break;
			default:
			// not custom object type
		}

		// rewrite properties from parsed data if object is custom
		if (editorObject) {
			// hacky way to copy parsed data
			editorObject.copy(object as any);

			editorObject.uuid = object.uuid;
			editorObject.material = material;
			editorObject.geometry = geometry;

			return editorObject as Object3D<THREE.Event> as T;
		}

		return object;
	}
}
