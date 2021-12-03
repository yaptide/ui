import { Object3D, ObjectLoader } from 'three';
import { Editor } from '../js/Editor';
import { BoxMesh, CylinderMesh, SphereMesh } from './BasicMeshes';

export class EditorObjectLoader extends ObjectLoader {
	private editor: Editor;
	constructor(editor: Editor) {
		super();
		this.editor = editor;
	}
	parseObject<T extends Object3D<THREE.Event>>(
		data: any,
		geometries: any[],
		materials: THREE.MeshBasicMaterial[],
		animations: THREE.AnimationClip[]
	): T {
		const geometry = geometries[data.geometry];
		const material = materials[data.material];

		let object = super.parseObject<T>(data, geometries, materials, animations);
		let editorObject;
		switch (data.type) {
			case 'SphereMesh':
				editorObject = new SphereMesh(this.editor);
				break;
			case 'BoxMesh':
				editorObject = new BoxMesh(this.editor);
				break;
			case 'CylinderMesh':
				editorObject = new CylinderMesh(this.editor);
				geometry.rotateX(Math.PI / 2);
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
