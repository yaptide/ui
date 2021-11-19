import * as THREE from "three";
import { ISimulationObject } from "./SimulationObject";

const defaultMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide, transparent: true, opacity: 0.5, wireframe: true });

const boxGeometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);

export class BoxMesh extends THREE.Mesh<THREE.BoxGeometry> implements ISimulationObject {
    type = 'BoxMesh';
    name = 'Box';
    constructor(geometry?: THREE.BoxGeometry, material?: THREE.Material) {
        super(geometry ?? boxGeometry, material ?? defaultMaterial.clone());
    }
}


const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, false, 0, Math.PI * 2);

export class CylinderMesh extends THREE.Mesh<THREE.CylinderGeometry> implements ISimulationObject {
    type = 'CylinderMesh';
    name = 'Cylinder';
    constructor(geometry?: THREE.CylinderGeometry, material?: THREE.Material) {
        super(geometry ?? cylinderGeometry, material ?? defaultMaterial.clone());
    }
}


const sphereGeometry = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI);

export class SphereMesh extends THREE.Mesh<THREE.SphereGeometry> implements ISimulationObject {
    readonly notRotatable = true;
    type = 'SphereMesh';
    name = 'Sphere';
    constructor(geometry?: THREE.SphereGeometry, material?: THREE.Material) {
        super(geometry ?? sphereGeometry, material ?? defaultMaterial.clone());
    }
}