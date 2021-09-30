import SimulationMaterial from '../util/SimulationMaterial';
import * as THREE from 'three';

export function EditorMaterials(){
    return{
        "Earth":    new SimulationMaterial("Earth",{color:new THREE.Color( 0x311907 )}),
        "Fire":     new SimulationMaterial("Fire",{color:new THREE.Color( 0xFF3D3D ),opacity:.5}),
        "Water":    new SimulationMaterial("Water",{color:new THREE.Color( 0x403DFF ),opacity:.5}),
        "Air":      new SimulationMaterial("Air",{color:new THREE.Color( 0xFFFED6 ),opacity:.2})
        // TODO: Replace this object with proper materials.
    }
}
export const materialOptions = {
    "Earth":"Earth",
    "Fire":"Fire",
    "Water":"Water",
    "Air":"Air"
};