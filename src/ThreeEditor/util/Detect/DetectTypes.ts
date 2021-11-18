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

export type Any = Mesh & Cyl & Zone & All;

export const DEFAULT_ANY: Any = {
    width: 1,
    height: 1,
    depth: 1,
    outerRadius: 1,
    innerRadius: 0,
    widthSegments: 1000,
    heightSegments: 1000,
    depthSegments: 1000,
    radialSegments: 1,
    zoneId: -1
};

export const DETECT_OPTIONS = {
    "Mesh": "Mesh",
    "Cyl": "Cyl",
    "Zone": "Zone",
    "All": "All"
} as const;

export type DETECT_TYPE = keyof typeof DETECT_OPTIONS;
