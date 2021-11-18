import { Signal } from "signals";
import * as THREE from "three";
import { Editor } from "../../js/Editor";
import * as CSG from "../CSG/CSG";
import { ISimulationObject } from "../SimulationObject";
import {
    DetectSection,
    DetectSectionJSON,
    isDetectSection,
} from "./DetectSection";

interface DetectManagerJSON {
    uuid: string;
    name: string;
    detectSections: DetectSectionJSON[];
}

export class DetectsContainer extends THREE.Group implements ISimulationObject {
    readonly notRemovable = true;
    readonly notMovable = true;
    readonly notRotatable = true;
    readonly notScalable = true;

    children: DetectSection[];
    readonly isDetectSectionsContainer: true = true;
    constructor() {
        super();
        this.name = "Sections";
        this.children = [];
    }

    reset() {
        this.name = "Sections";
        this.clear();
    }
}

export class DetectManager extends THREE.Scene implements ISimulationObject {
    readonly notRemovable = true;
    readonly notMovable = true;
    readonly notRotatable = true;
    readonly notScalable = true;

    private static _detectWireMaterial = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
        wireframe: true,
        color: new THREE.Color("cyan"),
    });

    detectsContainer: DetectsContainer;

    detectHelper: THREE.Mesh;

    private signals: {
        objectAdded: Signal<THREE.Object3D>;
        objectChanged: Signal<THREE.Object3D>;
        objectRemoved: Signal<THREE.Object3D>;
        objectSelected: Signal<THREE.Object3D>;
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
        this.detectsContainer = new DetectsContainer();
        this.detectHelper = new THREE.Mesh(
            undefined,
            DetectManager._detectWireMaterial
        );
        this.name = "DetectManager";
        this.editor = editor;
        this.add(this.detectsContainer);
        this.add(this.detectHelper);
        this.signals = editor.signals;
        this.signals.objectSelected.add(this.onObjectSelected);
        this.signals.detectGeometryChanged.add(this.onObjectSelected);
    }

    onObjectSelected = (object: THREE.Object3D) => {
        this.detectHelper.geometry.dispose();
        if (isDetectSection(object) && this.editor.selected === object) {
            this.detectHelper.position.copy(object.position);
            this.detectHelper.geometry = object.geometry.clone();
        } else {
            this.detectHelper.geometry = new THREE.BufferGeometry();
        }
        this.signals.sceneGraphChanged.dispatch();
    };

    createSection(): DetectSection {
        const section = new DetectSection(this.editor, {});
        this.addSection(section);
        return section;
    }

    addSection(section: DetectSection): void {
        this.detectsContainer.add(section);

        this.signals.objectAdded.dispatch(section);
        this.signals.detectSectionAdded.dispatch(section);
        this.signals.sceneGraphChanged.dispatch();
    }

    removeSection(section: DetectSection): void {
        this.detectsContainer.remove(section);
        this.signals.objectRemoved.dispatch(section);
        this.signals.detectSectionRemoved.dispatch(section);
        this.signals.sceneGraphChanged.dispatch();
    }

    fromJSON(data: DetectManagerJSON): void {
        if (!data) console.error("Passed empty data to load CSGManager", data);

        this.uuid = data.uuid;

        this.name = data.name;
        data.detectSections.forEach((sectionData) => {
            this.addSection(DetectSection.fromJSON(this.editor, sectionData));
        });
    }

    toJSON(): DetectManagerJSON {
        const detectSections = this.detectsContainer.children.map((section) =>
            section.toJSON()
        );
        const uuid = this.uuid;
        const name = this.name;
        return {
            uuid,
            name,
            detectSections,
        };
    }

    reset() {
        this.name = "DetectManager";

        this.userData = {};
        this.background = null;
        this.environment = null;

        this.detectsContainer.reset();

        this.detectHelper.geometry.dispose();
    }

    clone(recursive: boolean) {
        return new DetectManager(this.editor).copy(this, recursive) as this;
    }

    getSectionById(id: number): DetectSection | null {
        return this.detectsContainer.children.find(
            (child) => child.id === id
        ) as DetectSection | null;
    }
}
