import * as THREE from 'three';

import { AdditionalGeometryDataType } from '../../../util/AdditionalGeometryData';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationMeshJSON } from '../Base/SimulationMesh';
import { BasicFigure, BoxParameters } from '../Figures/BasicFigures';

const defaultMaterial = new THREE.MeshBasicMaterial({
	color: 0x00ff00,
	side: THREE.DoubleSide,
	transparent: true,
	opacity: 0.5,
	wireframe: true
});

const ctGeometry = new THREE.BoxGeometry(2, 0.5, 1, 1, 1, 1);
const ctMaterial = defaultMaterial.clone();

export type CTCubeJSON = Omit<
	SimulationMeshJSON & {
		pathOnServer: string;
	},
	never
>;

export class CTCube extends BasicFigure<THREE.BoxGeometry> {
	readonly notScalable = true;

	pathOnServer: string = '';

	constructor(
		editor: YaptideEditor,
		geometry?: THREE.BoxGeometry,
		material?: THREE.MeshBasicMaterial
	) {
		super(
			editor,
			'CT Cube',
			'CTCube',
			'BoxGeometry',
			geometry ?? ctGeometry,
			material ?? ctMaterial.clone()
		);
	}

	toJSON(): CTCubeJSON {
		const { pathOnServer } = this;
		return {
			...super.toJSON(),
			pathOnServer
		};
	}

	reconstructGeometryFromData(data: AdditionalGeometryDataType<BoxParameters>): void {
		if (data.geometryType !== this.geometryType) throw new Error('Geometry type mismatch');
		const {
			parameters: { width, height, depth }
		} = data;
		this.geometry = new THREE.BoxGeometry(width as number, height as number, depth as number);
	}
}

export const isCTCube = (x: unknown): x is CTCube => x instanceof CTCube;
