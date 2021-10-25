import { MATERIALS } from "./materials";
import SimulationMaterial from "./SimulationMaterial";
import * as THREE from "three";

export interface MaterialsManagerJSON {
    
    data: {
        id: string;
        name: string;
    },
    color: number,
    flatShading: boolean,
    blending?: unknown,
    opacity: number,
    transparent: boolean
}
export default class MaterialsManager{ 
    private prefabMaterials: Record<string,SimulationMaterial>;
    private customMaterials: Record<string,SimulationMaterial>;
    materialOptions: Record<string,string>;
    materials: Record<string, SimulationMaterial>;
    constructor(){
        const [materials, options] = this.createMaterialPrefabs();
        this.prefabMaterials = materials;
        this.materialOptions = options;
        this.customMaterials = {};
        const materialsHandler = {
            get: (target:Record<string,SimulationMaterial>, prop:string) => {

                return (prop && prop in target
                    ? target[ prop ]
                    : (prop && prop in this.prefabMaterials
                    ? this.prefabMaterials[ prop ]
                    : this.getDefaultMaterial()));
            },
            set: (target:Record<string,SimulationMaterial>, prop:string, value:unknown) => {

                Reflect.set(this.materialOptions, prop, prop);
                return Reflect.set(target, prop, value);
            },
        }
        this.materials = new Proxy(this.customMaterials,materialsHandler)
    }
    getDefaultMaterial() {
        const defaultName = Object.keys(this.prefabMaterials)[0];
        return defaultName in this.customMaterials
            ? this.customMaterials[defaultName]
            : this.prefabMaterials[defaultName];
    }
    private createMaterialPrefabs = () => {
        const editorMaterials = MATERIALS.reduce((prev, current) => {
            const next = [{
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
    toJSON(){
        const jsonObject:MaterialsManagerJSON[] = Object.entries(this.customMaterials).map((object => { 
            return {
                "data": object[1].simulationData,
                "color": object[1].color.getHex(),
                "flatShading": object[1].flatShading,
                // "blending": object[1].blending,
                //TODO: parse blending value
                "opacity": object[1].opacity,
                "transparent": object[1].transparent,
            }
        }))
        return jsonObject;
    }
    fromJSOM(json:MaterialsManagerJSON[]): void  {
        json?.forEach((object) => {
            this.materials[object.data.name] = new SimulationMaterial(object.data,{
                color: new THREE.Color(object.color),
                flatShading: object.flatShading,
                // blending: object.blending,
                opacity: object.opacity,
                transparent: object.transparent,
            })
        })
    }
}