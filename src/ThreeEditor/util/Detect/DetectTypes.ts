export type Mesh = {
    width: number,
    height: number,
    depth: number,
    widthSegments: number,
    heightSegments: number,
    depthSegments: number,
};

export type Cyl = {
    radius: number,
    height: number,
    radialSegments: number,
    heightSegments: number
};

export type Zone = {
    zoneId: number
};

export type All = {};

export type Any = {
    width: number,
    height: number,
    depth: number,
    radius: number,
    widthSegments: number,
    heightSegments: number,
    depthSegments: number,
    radialSegments: number,
    zoneId: number
};
export const DEFAULT_ANY:Any = {
    width: 1,
    height: 1,
    depth: 1,
    radius: 1,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1,
    radialSegments: 10,
    zoneId: -1
}
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
        radius: true,
        height: true,
        radialSegments: true,
        heightSegments: true
    },
    Zone:{
        zoneUuid: true
    },
    All:{}
}