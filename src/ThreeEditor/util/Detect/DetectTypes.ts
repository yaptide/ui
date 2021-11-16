export type Mesh = {
    width: number,
    height: number,
    depth: number,
    widthSegments: number,
    heightSegments: number,
    depthSegments: number,
};

export type Cyl = {
    outerRadius: number,
    innerRadius: number,
    depth: number,
    radialSegments: number,
    depthSegments: number
};

export type Zone = {
    zoneId: number
};

export type All = {};

export type Any = Mesh&Cyl&Zone&All;

export const DEFAULT_ANY:Any = {
    width: 1,
    height: 1,
    depth: 1,
    outerRadius: 1,
    innerRadius: 0,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1,
    radialSegments: 10,
    zoneId: -1
};

export type DETECT_TYPE = "Mesh" | "Cyl" | "Zone" | "All";

export const detectOptions = {
    "Mesh": "Mesh",
    "Cyl": "Cyl",
    "Zone": "Zone",
    "All": "All"
}

export const TYPE_RECORD:Record<string,Record<string,boolean>> = {
    Mesh:{
        width: true,
        height: true,
        depth: true,
        widthSegments: true,
        heightSegments: true,
        depthSegments: true
    },
    Cyl:{
        outerRadius: true,
        innerRadius: true,
        depth: true,
        radialSegments: true,
        depthSegments: true
    },
    Zone:{
        zoneUuid: true
    },
    All:{}
}