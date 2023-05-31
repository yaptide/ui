import * as THREE from 'three';

export type PossibleGeometryType =
	| THREE.BoxGeometry
	| THREE.CylinderGeometry
	| THREE.SphereGeometry;

const geometryParameters = {
	BoxGeometry: ['width', 'height', 'depth'],
	CylinderGeometry: [
		['radius', 'radiusTop'],
		['depth', 'height']
	],
	SphereGeometry: ['radius'],
	RingGeometry: ['innerRadius', 'outerRadius']
};

export type AdditionalGeometryDataType = {
	id: number;
	geometryType: string;
	position: THREE.Vector3Tuple;
	rotation: THREE.Vector3Tuple;
	parameters: {
		[key: string]: number | string;
	};
	userSetRotation?: boolean;
};

export const getGeometryParameters = (geometry: PossibleGeometryType) => {
	const parameters: { [key: string]: number } = {};

	const type = geometry.type as keyof typeof geometryParameters;

	geometryParameters[type].forEach(prop => {
		parameters[Array.isArray(prop) ? prop[0] : prop] =
			geometry.parameters[
				(Array.isArray(prop) ? prop[1] : prop) as keyof typeof geometry.parameters
			];
	});

	return parameters;
};

export function getGeometryData(geometryMesh: THREE.Mesh | THREE.Points) {
	const geometry = geometryMesh.geometry as PossibleGeometryType;

	const parameters = getGeometryParameters(geometry);

	let geometryData: AdditionalGeometryDataType = {
		id: geometryMesh.id,
		geometryType: geometryMesh.geometry.type,
		position: geometryMesh.position.toArray(),
		rotation: geometryMesh.userData['rotation'],
		parameters
	};

	if (!geometryMesh.userData['userSetRotation'])
		geometryData = {
			...geometryData,
			rotation: geometryMesh.rotation
				.toArray()
				.slice(0, 3)
				.map(v => (v as number) * THREE.MathUtils.RAD2DEG) as THREE.Vector3Tuple
		};

	return geometryData;
}
