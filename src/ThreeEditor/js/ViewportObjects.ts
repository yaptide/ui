import * as CSG from "../util/CSG/CSG";
import * as THREE from "three";
import { DetectSection, isDetectSection } from "../util/Detect/DetectSection";

export class ViewportObjects {
    private figures: Array<THREE.Object3D> = [];
    private zones: CSG.Zone[] = [];
    private sections: DetectSection[] = [];

    getSelectable({
        selectFigures = true,
        selectZones = false,
        selectSections = false}
    ):THREE.Object3D[]{
        let selectableObjects: THREE.Object3D[] = [];

        if(selectFigures) selectableObjects = selectableObjects.concat(this.figures);
        if(selectZones) selectableObjects = selectableObjects.concat(this.zones);
        if(selectSections) selectableObjects = selectableObjects.concat(this.sections);

        return selectableObjects;
    }

    push(object:THREE.Object3D): number{

        if(CSG.isZone(object)) this.zones.push(object);
        else if(isDetectSection(object)) this.sections.push(object);
        else this.figures.push(object);

        return this.figures.length + this.zones.length + this.sections.length;
    }

    cut(object:THREE.Object3D): number{

        if(CSG.isZone(object)) this.zones.splice(this.zones.indexOf(object), 1);
        else if(isDetectSection(object)) this.sections.splice(this.sections.indexOf(object), 1);
        else this.figures.splice(this.figures.indexOf(object), 1);

        return this.figures.length + this.zones.length + this.sections.length;
    }
}
