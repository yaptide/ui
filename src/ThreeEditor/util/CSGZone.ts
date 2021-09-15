import { BufferGeometry, Material, Mesh } from "three";

export class CSGZone<
    TGeometry extends BufferGeometry = BufferGeometry,
    TMaterial extends Material | Material[] = Material | Material[],
> extends Mesh {
    

    constructor(geometry?: TGeometry, material?: TMaterial) {
		super(geometry, material);
		this.type = 'Zone';

	}
}