import * as THREE from 'three';
import { HollowCylinderGeometry } from '../ThreeEditor/Simulation/Base/HollowCylinderGeometry';

export type PossibleGeometryType =
	| THREE.BoxGeometry
	| THREE.CylinderGeometry
	| THREE.SphereGeometry
	| HollowCylinderGeometry;

const geometryParameters = {
	BoxGeometry: ['width', 'height', 'depth'],
	CylinderGeometry: [
		['radius', 'radiusTop'],
		['depth', 'height']
	],
	SphereGeometry: ['radius'],
	HollowCylinderGeometry: ['innerRadius', 'outerRadius', ['depth', 'height']]
};

export type AdditionalGeometryDataType<ParametersType extends {} = {}> = {
	geometryType: string;
	position: THREE.Vector3Tuple;
	rotation: THREE.Vector3Tuple;
	parameters: ParametersType;
	userSetRotation?: boolean;
};

export const getGeometryParameters = (geometry: PossibleGeometryType) => {
	const parameters: { [key: string]: number } = {};

	const type = geometry.type as keyof typeof geometryParameters;

	geometryParameters[type]?.forEach(prop => {
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
