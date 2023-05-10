import * as THREE from 'three';
import { BasicFigure } from '../Figures/BasicFigures';
import { Editor } from '../../js/Editor';

const defaultMaterial = new THREE.MeshBasicMaterial({
	color: 0x00ff00,
	side: THREE.DoubleSide,
	transparent: true,
	opacity: 0.5,
	wireframe: true
});

const ctGeometry = new THREE.BoxGeometry(2, 0.5, 1, 1, 1, 1);
const ctMaterial = defaultMaterial.clone();
export class CTCube extends BasicFigure<THREE.BoxGeometry> {
	readonly notScalable = true;

	pathOnServer: string = '';

	constructor(editor: Editor, geometry?: THREE.BoxGeometry, material?: THREE.MeshBasicMaterial) {
		super(editor, 'CT', 'CTCube', 'CT', geometry ?? ctGeometry, material ?? ctMaterial.clone());
	}

	toJSON(
		meta:
			| { geometries: unknown; materials: unknown; textures: unknown; images: unknown }
			| undefined
	) {
		const json = super.toJSON(meta);
		json.object.pathOnServer = this.pathOnServer;
		return json;
	}
}

export const isCTCube = (x: unknown): x is CTCube => x instanceof CTCube;
