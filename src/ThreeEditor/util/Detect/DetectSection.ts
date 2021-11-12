import { Signal } from "signals";
import * as THREE from "three";
import { Editor } from "../../js/Editor";
import * as CSG from "../CSG/CSG";
import { ISimulationObject } from "../SimulationObject";
import * as DETECT from "./DetectTypes";

type DetectSectionArgs = {
    data?: DETECT.Any;
    type?: DETECT.DETECT_TYPE;
};

export interface DetectSectionJSON {
    data: DETECT.Any;
    type: DETECT.DETECT_TYPE;
}

export class DetectSection extends THREE.Mesh implements ISimulationObject {
    readonly notRemovable = false;
    readonly notMovable!: never;
    readonly notRotatable = true;
    readonly notScalable = true;

    private static detectMaterial: THREE.MeshBasicMaterial =
        new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5,
            wireframe: true,
            color: new THREE.Color("cyan"),
        });

    private proxy: DetectSection; // use proxy to conditionally return notMoveable property;

    detectGeometryData: DETECT.Any;
    detectGeometryType: DETECT.DETECT_TYPE;
    maxDisplayDensity: number = 10;
    autoSplitGrid: boolean = true;

    private signals: {
        objectAdded: Signal<THREE.Object3D>;
        objectChanged: Signal<THREE.Object3D>;
        objectRemoved: Signal<THREE.Object3D>;
        zoneGeometryChanged: Signal<CSG.Zone>;
        zoneEmpty: Signal<CSG.Zone>;
        sceneGraphChanged: Signal;
        CSGManagerStateChanged: Signal;
        detectSectionAdded: Signal<DetectSection>;
        detectSectionRemoved: Signal<DetectSection>;
        detectGeometryChanged: Signal<DetectSection>;
        objectSelected: Signal<THREE.Object3D>;
    };
    readonly isDetectGeo: true = true;

    private dataObject: DETECT.Any;
    private editor: Editor;
    private disableGeometryUpdate: boolean = false;

    private tryUpdateGeometry = (type:DETECT.DETECT_TYPE = this.detectGeometryType) => {
        if (!this.disableGeometryUpdate){ 
            this.geometry.dispose();
            this.geometry = this.generateGeometry(undefined,type)
            this.geometry.computeBoundingSphere();
        };
    };
    
    private overrideHandler = {
        get: (target: DetectSection, p: keyof DetectSection) => {
            let result: unknown;
            switch (p) {
                case "notMovable":
                    result = ["Zone", "All"].includes(this.detectGeometryType);
                    break;
                case "type":
                    result = target.detectGeometryType + target.type;
                    break;
                default:
                    result = Reflect.get(target, p);
            }
            return result;
        },
        set: (target: DetectSection, p: keyof DetectSection, value: unknown, receiver:unknown) => {
            const result = Reflect.set(target, p, value, receiver);
            if(p === "detectGeometryType"){
                this.tryUpdateGeometry(value as DETECT.DETECT_TYPE);
                this.signals.objectSelected.dispatch(this.proxy);
            }
            return result;
        }
    };

    private generateGeometry(
        data: DETECT.Any = this.detectGeometryData,
        type: DETECT.DETECT_TYPE = this.detectGeometryType
    ): THREE.BufferGeometry {
        let geometry: THREE.BufferGeometry = new THREE.BufferGeometry();
        console.log(
            `Generating geometry for DetectSection ${this.uuid} of type ${type}`,
            data, type
        )
        switch (type) {
            case "Mesh":
                geometry = new THREE.BoxGeometry(
                    data.width,
                    data.height,
                    data.depth,
                    Math.min(data.widthSegments, this.maxDisplayDensity),
                    Math.min(data.heightSegments, this.maxDisplayDensity),
                    Math.min(data.depthSegments, this.maxDisplayDensity)
                );
                break;
            case "Cyl":
                geometry = new THREE.CylinderGeometry(
                    data.radius,
                    data.radius,
                    data.height,
                    data.radialSegments,
                    data.heightSegments
                );
                break;
            case "Zone":
                let zone = this.editor.zonesManager.getZoneById(data.zoneId);
                geometry = zone?.geometry.clone() ?? geometry;
                break;
            case "All":
                break;
            default:
                throw new Error(`${type} is not a valid Detect Geometry type`);
        }
        return geometry;
    }

    constructor(
        editor: Editor,
        { data = DETECT.DEFAULT_ANY, type = "Mesh" }: DetectSectionArgs
    ) {
        super();
        this.editor = editor;
        this.signals = editor.signals;
        this.name = `DetectSection${this.id}`;
        this.type = 'Section';
        this.dataObject = data;
        this.detectGeometryData = new Proxy(this.dataObject, {
            set: (target:DETECT.Any, p: keyof DETECT.Any, value: unknown, receiver:unknown) => {
                const result = Reflect.set(target, p, value, receiver);
                this.tryUpdateGeometry();
                return result;
            },
        });
        this.geometry = this.generateGeometry(data, type);
        this.material = DetectSection.detectMaterial;
        this.detectGeometryType = type;
        this.signals.zoneGeometryChanged.add((zone) => {
            if (zone.id === this.dataObject.zoneId)
                this.geometry = this.generateGeometry();
        });

        this.proxy = new Proxy(this, this.overrideHandler);

        return this.proxy;
    }

    getMesh(): DETECT.Mesh {
        if (this.detectGeometryType !== "Mesh")
            throw new Error(
                `DetectGeo of uui=${this.uuid} isn't of 'Mesh' type`
            );
            return Object.assign({}, this.dataObject as DETECT.Mesh);
    }

    getCyl(): DETECT.Cyl {
        if (this.detectGeometryType !== "Cyl")
            throw new Error(
                `DetectGeo of uui=${this.uuid} isn't of 'Cyl' type`
            );
        return Object.assign({}, this.dataObject as DETECT.Cyl);
    }

    getZone(): DETECT.Zone {
        if (this.detectGeometryType !== "Zone")
            throw new Error(
                `DetectGeo of uui=${this.uuid} isn't of 'Zone' type`
            );
        return Object.assign({}, this.dataObject as DETECT.Zone);
    }

    getAll(): DETECT.All {
        if (this.detectGeometryType !== "All")
            throw new Error(
                `DetectGeo of uui=${this.uuid} isn't of 'All' type`
            );
        return {};
    }

    getData(
        type: DETECT.DETECT_TYPE = this.detectGeometryType
    ):  Partial<DETECT.Any> {
        switch(type){
            case 'Mesh':
                return this.getMesh();
            case 'Cyl':
                return this.getCyl();
            case 'Zone':
                return this.getZone();
            case 'All':
            default:
                return this.getAll();
        }
    }

    setData(data: DETECT.Any): void {
        this.disableGeometryUpdate = true;
        Object.assign(this.detectGeometryData, data);
        this.disableGeometryUpdate = false;
        this.tryUpdateGeometry();
    }

    copy(source: this, recursive = true) {
        return new Proxy(
            super.copy(source, recursive),
            this.overrideHandler
        ) as this;
    }

    toJSON(): DetectSectionJSON {
        let data = this.dataObject;
        let type = this.detectGeometryType;
        return {
            data,
            type,
        };
    }

    fromJSON(data: DetectSectionJSON): void {
        this.dataObject = data.data;
        this.detectGeometryType = data.type;
        this.geometry = this.generateGeometry();
    }

    static fromJSON(editor: Editor, data: DetectSectionJSON): DetectSection {
        let detectSection = new DetectSection(editor, data);
        return detectSection;
    }
}

export const isDetectSection = (x: any): x is DetectSection =>
    x instanceof DetectSection;
