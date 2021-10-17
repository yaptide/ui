import SimulationMaterial from '../util/Materials/SimulationMaterial';
import {MATERIALS} from '../util/Materials/materials.ts';

export function createEditorMaterials(){
    let editorMaterials = MATERIALS.reduce((prev, current) => {
        let next = [{
                ...prev[0],
                [current.name]: new SimulationMaterial(current,{})
            },
            {
                ...prev[1],
                [current.name]: current.name
            }
        ]
        return next;
    },[{},{}]);
    return editorMaterials;
}