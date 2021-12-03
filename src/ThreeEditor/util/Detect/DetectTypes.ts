export type Mesh = {
	width: number;
	height: number;
	depth: number;
	xSegments: number;
	ySegments: number;
	zSegments: number;
};

export type Cyl = {
	radius: number;
	innerRadius: number;
	depth: number;
	radialSegments: number;
	zSegments: number;
};

export type Zone = {
	zoneId: number;
};

export type All = {};

export type Any = Mesh & Cyl & Zone & All;

export const DEFAULT_ANY: Any = {
	width: 1,
	height: 1,
	depth: 1,
	radius: 1,
	innerRadius: 0,
	xSegments: 1,
	ySegments: 1,
	zSegments: 100,
	radialSegments: 1,
	zoneId: -1
};

export const DETECT_OPTIONS = {
	Mesh: 'Mesh',
	Cyl: 'Cyl',
	Zone: 'Zone',
	All: 'All'
} as const;

export type DETECT_TYPE = keyof typeof DETECT_OPTIONS;
