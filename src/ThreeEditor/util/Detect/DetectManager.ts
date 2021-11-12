import { Signal } from "signals";
import * as THREE from "three";
import { Editor } from "../../js/Editor";
import * as CSG from "../CSG/CSG";
import { ISimulationObject } from "../SimulationObject";
import { DetectSection, DetectSectionJSON } from "./DetectSection";

interface DetectManagerJSON {
    uuid: string;
    name: string;
    detectSections: DetectSectionJSON[];
}

export class DetectManager extends THREE.Scene implements ISimulationObject {
    readonly notRemovable = true;
    readonly notMovable = true;
    readonly notRotatable = true;
    readonly notScalable = true;

    children: DetectSection[];

    private signals: {
        objectAdded: Signal<THREE.Object3D>;
        objectChanged: Signal<THREE.Object3D>;
        objectRemoved: Signal<THREE.Object3D>;
        zoneGeometryChanged: Signal<CSG.Zone>;
        sceneGraphChanged: Signal;
        detectSectionAdded: Signal<DetectSection>;
        detectSectionRemoved: Signal<DetectSection>;
        detectGeometryChanged: Signal<DetectSection>;
    };
    readonly isDetectManager: true = true;

    private editor: Editor;

    constructor(editor: Editor) {
        super();
        this.name = "Detect";
        this.editor = editor;
        this.children = [];
        this.signals = editor.signals;
    }

    createSection(): DetectSection {
        let section = new DetectSection(this.editor, {});
        this.addSection(section);
        return section;
    }

    addSection(section: DetectSection): void {
        this.add(section);

        this.signals.objectAdded.dispatch(section);
        this.signals.detectSectionAdded.dispatch(section);
        this.signals.sceneGraphChanged.dispatch();
    }

    removeSection(section: DetectSection): void {
        this.remove(section);
        this.signals.objectRemoved.dispatch(section);
        this.signals.detectSectionRemoved.dispatch(section);
        this.signals.sceneGraphChanged.dispatch();
    }

    fromJSON(data: DetectManagerJSON): void {
        if (!data)
            console.warn('Passed empty data to load CSGManager', data)

        this.uuid = data.uuid;

        this.name = data.name;
        data.detectSections.forEach((sectionData) => {

            this.addSection(DetectSection.fromJSON(this.editor, sectionData));

        });
    }

    toJSON(): DetectManagerJSON {
        let detectSections = this.children.map((section) => section.toJSON());
        let uuid = this.uuid;
        let name = this.name;
        return {
            uuid,
            name,
            detectSections,
        };
    }

    reset() {
        this.name = "Detect";
        this.userData = {};
        this.clear();
    }
    
    clone(recursive: boolean) {
        return new DetectManager(this.editor).copy(this, recursive) as this;
    }

    getSectionById(id: number): DetectSection | null {
        return this.children.find(
            (child) => child.id === id
        ) as DetectSection | null;
    }
}
