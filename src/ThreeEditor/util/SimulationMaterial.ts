import * as THREE from 'three'

export default class SimulationMaterial{
    material:THREE.Material;
    constructor(name:string,args:any){
        this.material = new THREE.MeshPhongMaterial({
            name,
            flatShading: true,
            side: THREE.DoubleSide,
            transparent: true,
            ...args
        });
    }
}