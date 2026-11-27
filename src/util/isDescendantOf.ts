import { Object3D } from 'three';

export const isDescendantOf = (object: Object3D | null | undefined, ancestor: Object3D) => {
	for (let current = object?.parent; current; current = current.parent) {
		if (current === ancestor) {
			return true;
		}
	}

	return false;
};
