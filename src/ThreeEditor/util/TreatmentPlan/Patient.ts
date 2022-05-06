import * as THREE from 'three';
import { Editor } from '../../js/Editor';
import { SimulationObject3D } from '../SimulationBase/SimulationMesh';

const path = new Path2D(
	'M22 11L22 13L9 13L9 7L18 7C 20.21 7 22 8.79 22 11zM2 14L2 16L8 16L8 18L16 18L16 16L22 16L22 14L2 14zM7.14 12.1C 8.3 10.91 8.28 9.02 7.1 7.8600006C 5.91 6.700001 4.02 6.7200007 2.8600001 7.9000006C 1.7000002 9.09 1.7200001 10.9800005 2.9 12.14C 4.09 13.3 5.98 13.280001 7.14 12.1z'
); // Copied from Airline seat flat SVG icon

const ICON_SIZE = 128.0;
export class Patient extends SimulationObject3D {
	constructor(editor: Editor) {
		super(editor, 'Patient', 'Patient');
		const canvas = document.createElement('canvas');
		canvas.width = ICON_SIZE;
		canvas.height = ICON_SIZE;
		const ctx = canvas.getContext('2d');
		if (ctx) {
			//rescale path to fill canvas
			ctx.scale(ICON_SIZE / 24.0, ICON_SIZE / 24.0);
			ctx.fillStyle = '#000000';
			ctx.fillRect(0, 0, ICON_SIZE, ICON_SIZE);
			ctx.fillStyle = '#ffffff';
			ctx.fill(path);
			const map = new THREE.CanvasTexture(canvas);
			map.needsUpdate = true;
			const material = new THREE.SpriteMaterial({
				map,
				color: 0xffffff,
				alphaMap: map,
				sizeAttenuation: false
			});
			const sprite = new THREE.Sprite(material);
			sprite.scale.set(12 / ICON_SIZE, 12 / ICON_SIZE, 1);
			this.add(sprite);
		} else {
			console.error('Error: Could not create canvas for Patient icon');
		}
	}
}
