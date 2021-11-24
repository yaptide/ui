import * as THREE from 'three';

export type PossibleGeometryType =
	| THREE.BoxGeometry
	| THREE.CylinderGeometry
	| THREE.SphereGeometry;

const geometryParameters = {
	BoxGeometry: ['width', 'height', 'depth'],
	CylinderGeometry: ['radiusTop', 'height'],
	SphereGeometry: ['radius']
};

export interface AdditionalUserDataType {
	id: number;
	geometryType: string;
	position: THREE.Vector3Tuple;
	rotation: THREE.Vector3Tuple;
	parameters: {
		[key: string]: number;
	};
	userSetRotation?: boolean;
}

export const getGeometryParameters = (geometry: PossibleGeometryType) => {
	const parameters: { [key: string]: number } = {};

	const type = geometry.type as keyof typeof geometryParameters;

	geometryParameters[type].forEach(prop => {
		parameters[prop] = geometry.parameters[prop as keyof typeof geometry.parameters];
	});

	return parameters;
}

export function generateSimulationInfo(geometryMesh: THREE.Mesh<PossibleGeometryType>) {

	const geometry = geometryMesh.geometry as PossibleGeometryType;

	const parameters = getGeometryParameters(geometry);

	let userData: AdditionalUserDataType = {
		id: geometryMesh.id,
		geometryType: geometryMesh.geometry.type,
		position: geometryMesh.position.toArray(),
		rotation: geometryMesh.userData['rotation'],
		parameters
	};

	if (!geometryMesh.userData['userSetRotation'])
		userData = {
			...userData,
			rotation: geometryMesh.rotation
				.toVector3()
				.toArray()
				.map(v => v * THREE.MathUtils.RAD2DEG) as THREE.Vector3Tuple
		};

	return userData;
}
