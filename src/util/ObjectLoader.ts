import { Object3D, ObjectLoader } from 'three';
import { YaptideEditor } from '../ThreeEditor/js/Editor';
import {
	BoxFigure,
	CylinderFigure,
	SphereFigure
} from '../ThreeEditor/Simulation/Figures/BasicFigures';
import { CTCube } from '../ThreeEditor/Simulation/SpecialComponents/CTCube';

export class EditorObjectLoader extends ObjectLoader {
	private editor: YaptideEditor;
	constructor(editor: YaptideEditor) {
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
			case 'SphereFigure':
				editorObject = new SphereFigure(this.editor);
				break;
			case 'BoxFigure':
				editorObject = new BoxFigure(this.editor);
				break;
			case 'CylinderFigure':
				editorObject = new CylinderFigure(this.editor);
				geometry.rotateX(Math.PI / 2);
				break;
			case 'CTCube':
				editorObject = new CTCube(this.editor);
				editorObject.pathOnServer = data.pathOnServer;
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
