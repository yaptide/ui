import { Object3D } from 'three';

import { AdditionalGeometryDataType } from '../../../util/AdditionalGeometryData';
import { YaptideEditor } from '../../js/YaptideEditor';
import { SimulationElement, SimulationElementJSON } from './SimulationElement';
import { SimulationMesh } from './SimulationMesh';

export type SimulationPlaneJSON = Omit<
	SimulationElementJSON & {
		value?: number;
		visible: boolean;
	},
	never
>;

export default class Plane extends SimulationElement {
	value: number;
	constructor(editor: YaptideEditor, value: number = 0) {
		super(editor, 'XYP', 'integer');
		this.value = value;
	}
}

export const isPlane = (x: unknown): x is Plane => x instanceof Plane;
