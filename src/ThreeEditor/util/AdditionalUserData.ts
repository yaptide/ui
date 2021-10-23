import * as THREE from "three";


export type PossibleGeometryType = THREE.BoxGeometry | THREE.CylinderGeometry | THREE.SphereGeometry;

const geometryParameters = {
    'BoxGeometry': ['width'],
    'CylinderGeometry': ['radiusTop', 'height'],
    'SphereGeometry': ['radius'],
}

export function generateSimulationInfo(geometryMesh: THREE.Mesh<PossibleGeometryType>) {

    let parameters: { [key: string]: unknown } = {}

    const type = geometryMesh.geometry.type as keyof typeof geometryParameters;

    const geometry = geometryMesh.geometry as PossibleGeometryType;

    geometryParameters[type].forEach(prop => {
        parameters[prop] = geometry.parameters[prop as keyof typeof geometry.parameters]
    });

    const userData = {
        id: geometryMesh.id,
        geometryType: geometryMesh.geometry.type,
        position: geometryMesh.position.toArray(),
        rotation: geometryMesh.rotation.toVector3().toArray().map(v => +(v * THREE.MathUtils.RAD2DEG).toFixed(2)),

        parameters,
    }

    return userData;
}