import { Object3D } from 'three';

export const incrementName = (name: string, until: (name: string) => boolean) => {
	if (until(name)) {
		const nameSplit = name.split('_');
		const lastInName = nameSplit.length > 1 ? nameSplit.pop() ?? '' : '';
		let nameBase = nameSplit.join('_');

		let nameNumber = parseInt(lastInName);

		if (isNaN(nameNumber)) {
			nameNumber = 1;
			if (lastInName.length > 0) nameBase = `${nameBase}_${lastInName}`;
		}

		let newName = nameBase + '_' + nameNumber;
		while (until(newName)) {
			nameNumber++;
			newName = nameBase + '_' + nameNumber;
		}
		return newName;
	}
	return name;
};

export interface UniqueChildrenNames {
	getNextFreeName(object: Object3D, newName?: string): string;
}

export const implementsUniqueChildrenNames = (x: unknown): x is UniqueChildrenNames => {
	return typeof x === 'object' && x !== null && 'getNextFreeName' in x;
};

export const getNextFreeName = (parent: Object3D, name: string, searchingObject?: Object3D) => {
	return incrementName(name, name => {
		const child = parent.getObjectByName(name);
		return child !== searchingObject && !!child;
	});
};
