import * as CSG from '../../util/CSG/CSG';
import * as THREE from 'three';
import { DetectGeometry, isDetectGeometry } from '../../util/Detect/DetectGeometry';
import { Editor } from '../Editor';

export class ViewportObjects {
	private figures: Array<THREE.Object3D> = [];
	private zones: CSG.Zone[] = [];
	private detects: DetectGeometry[] = [];
	private editor: Editor;

	constructor(editor: Editor) {
		this.editor = editor;
	}

	getSelectable({
		selectFigures = true,
		selectZones = false,
		selectSections = false
	}): THREE.Object3D[] {
		let selectableObjects: THREE.Object3D[] = [];

		if (selectFigures) selectableObjects = selectableObjects.concat(this.figures);
		if (selectZones) selectableObjects = selectableObjects.concat(this.zones);
		if (selectSections) selectableObjects = selectableObjects.concat(this.detects);

		return selectableObjects;
	}

	push(object: THREE.Object3D): number {
		if (CSG.isZone(object)) this.zones.push(object);
		else if (isDetectGeometry(object)) this.detects.push(object);
		else this.figures.push(object);

		return this.figures.length + this.zones.length + this.detects.length;
	}

	cut(object: THREE.Object3D): number {
		if (CSG.isZone(object)) this.zones.splice(this.zones.indexOf(object), 1);
		else if (isDetectGeometry(object)) this.detects.splice(this.detects.indexOf(object), 1);
		else this.figures.splice(this.figures.indexOf(object), 1);

		return this.figures.length + this.zones.length + this.detects.length;
	}
}
