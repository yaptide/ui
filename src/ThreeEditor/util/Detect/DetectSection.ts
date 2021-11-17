import { Signal } from "signals";
import * as THREE from "three";
import { Editor } from "../../js/Editor";
import * as CSG from "../CSG/CSG";
import { ISimulationObject } from "../SimulationObject";
import { DetectManager } from "./DetectManager";
import * as DETECT from "./DetectTypes";

export interface DetectSectionJSON {
    data: DETECT.Any;
    type: DETECT.DETECT_TYPE;
    position: THREE.Vector3Tuple;
}

type DetectSectionArgs = Partial<DetectSectionJSON>;

export class DetectSection extends THREE.Points implements ISimulationObject {
    readonly notRemovable = false;
    readonly notMovable!: never;
    readonly notRotatable = true;
    readonly notScalable = true;
    readonly isDetectSection: true = true;

    private static _detectPointsMaterial: THREE.PointsMaterial =
        new THREE.PointsMaterial({ color: new THREE.Color("cyan"), size: 0.1 });

    private positionProxy: THREE.Vector3;

    private proxy: DetectSection; // use proxy to conditionally return notMoveable property;

    detectGeometryData: DETECT.Any;
    detectGeometryType: DETECT.DETECT_TYPE;
    static maxDisplayDensity: number = 4;
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

    private tryUpdateGeometry = (
        type: DETECT.DETECT_TYPE = this.detectGeometryType
    ) => {
        if (!this.disableGeometryUpdate) {
            this.geometry.dispose();
            this.geometry = this.generateGeometry(undefined, type);
            this.geometry.computeBoundingSphere();
        }
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
                case "position":
                    result = this.positionProxy;
                    break;
                default:
                    result = Reflect.get(target, p);
            }
            return result;
        },
        set: (
            target: DetectSection,
            p: keyof DetectSection,
            value: unknown,
            receiver: unknown
        ) => {
            const result = Reflect.set(target, p, value, receiver);
            if (p === "detectGeometryType") {
                this.tryUpdateGeometry(value as DETECT.DETECT_TYPE);
                this.signals.objectSelected.dispatch(this.proxy);
            } else if (p === "geometry") {
                this.geometry.computeBoundingSphere();
                this.updateMatrixWorld(true);
            }
            return result;
        },
    };

    private generateGeometry(
        data: DETECT.Any = this.detectGeometryData,
        type: DETECT.DETECT_TYPE = this.detectGeometryType
    ): THREE.BufferGeometry {
        let geometry: THREE.BufferGeometry = new THREE.BufferGeometry();

        switch (type) {
            case "Mesh":
                geometry = new THREE.BoxGeometry(
                    data.width,
                    data.height,
                    data.depth,
                    Math.min(
                        data.widthSegments,
                        DetectSection.maxDisplayDensity
                    ),
                    Math.min(
                        data.heightSegments,
                        DetectSection.maxDisplayDensity
                    ),
                    Math.min(
                        data.depthSegments,
                        DetectSection.maxDisplayDensity
                    )
                );
                break;
            case "Cyl":
                geometry = createCylindricalGeometry(data, this.matrix);
                geometry = geometry.rotateX(Math.PI / 2); // rotate to align along the z axis
                break;
            case "Zone":
                let zone = this.editor.zonesManager.getZoneById(data.zoneId);
                geometry =
                    zone?.geometry
                        .clone()
                        .translate(
                            -this.position.x,
                            -this.position.y,
                            -this.position.z
                        ) ?? geometry;

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
        {
            data = DETECT.DEFAULT_ANY,
            type = "Mesh",
            position = [0, 0, 0],
        }: DetectSectionArgs
    ) {
        super();
        this.editor = editor;
        this.signals = editor.signals;
        this.name = `DetectSection${this.id}`;
        this.position.fromArray(position);
        // this.type = 'Section';
        this.dataObject = data;
        this.detectGeometryData = new Proxy(this.dataObject, {
            set: (
                target: DETECT.Any,
                p: keyof DETECT.Any,
                value: unknown,
                receiver: unknown
            ) => {
                const result = Reflect.set(target, p, value, receiver);
                this.tryUpdateGeometry();
                return result;
            },
        });

        this.positionProxy = new Proxy(this.position, {
            get: (target: THREE.Vector3, p: keyof THREE.Vector3) => {
                let scope = this;
                let parent: DetectManager = this.parent!
                    .parent as DetectManager;
                switch (p) {
                    case "copy":
                        return function (v: THREE.Vector3) {
                            target[p].apply(target, [v]);
                            return scope.positionProxy;
                        };
                    case "add":
                        return function (v: THREE.Vector3) {
                            let nV = target[p].apply(target, [v]);
                            parent.detectHelper.position.copy(nV);
                            return nV;
                        };
                    default:
                        return Reflect.get(target, p);
                }
            },
        });

        this.geometry = this.generateGeometry(data, type);
        this.material = DetectSection._detectPointsMaterial;
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
    ): Partial<DETECT.Any> {
        switch (type) {
            case "Mesh":
                return this.getMesh();
            case "Cyl":
                return this.getCyl();
            case "Zone":
                return this.getZone();
            case "All":
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
        let position = this.position.toArray();
        return {
            data,
            type,
            position,
        };
    }

    fromJSON(data: DetectSectionJSON): void {
        this.dataObject = data.data;
        this.detectGeometryType = data.type;
        this.geometry = this.generateGeometry();
        console.warn(data.position);
        this.position.fromArray(data.position);
    }

    static fromJSON(editor: Editor, data: DetectSectionJSON): DetectSection {
        let detectSection = new DetectSection(editor, data);
        return detectSection;
    }
}

export const isDetectSection = (x: any): x is DetectSection =>
    x instanceof DetectSection;

function createCylindricalGeometry(data: DETECT.Cyl, matrix: THREE.Matrix4) {
    let averageRadius = (data.outerRadius - data.innerRadius) / 2;
    let geometry1 = new THREE.CylinderGeometry(
        data.outerRadius,
        data.outerRadius,
        data.depth,
        20,
        Math.min(data.depthSegments, DetectSection.maxDisplayDensity)
    );
    let geometry2 = new THREE.CylinderGeometry(
        averageRadius,
        averageRadius,
        data.depth,
        20,
        Math.min(data.depthSegments, DetectSection.maxDisplayDensity)
    );

    let geometry3 = new THREE.CylinderGeometry(
        data.innerRadius,
        data.innerRadius,
        data.depth,
        20,
        Math.min(data.depthSegments, DetectSection.maxDisplayDensity)
    );
    let cyl1 = new THREE.Mesh(geometry1);
    let cyl2 = new THREE.Mesh(geometry2);
    let cyl3 = new THREE.Mesh(geometry3);
    cyl1.updateMatrix();
    cyl2.updateMatrix();
    cyl3.updateMatrix();
    let BSP1 = CSG.CSG.fromMesh(cyl1);
    let BSP2 = CSG.CSG.fromMesh(cyl2);
    let BSP3 = CSG.CSG.fromMesh(cyl3);
    let newGeometry = CSG.CSG.toGeometry(
        data.innerRadius ? BSP1.subtract(BSP3).union(BSP2.subtract(BSP3)) : BSP1.subtract(BSP2).union(BSP2),
        matrix
    );
    return newGeometry;
}
