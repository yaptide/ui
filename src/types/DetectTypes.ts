export abstract class Data<T> {
	info: string;
	constructor(info: string) {
		this.info = info;
	}
	abstract toJSON(): T;
}
export interface MeshData {
	width: number;
	height: number;
	depth: number;
	xSegments: number;
	ySegments: number;
	zSegments: number;
}

export interface CylData {
	radius: number;
	innerRadius: number;
	depth: number;
	radialSegments: number;
	zSegments: number;
}
export class Mesh extends Data<MeshData> implements MeshData {
	width: number;
	height: number;
	depth: number;
	xSegments: number;
	ySegments: number;
	zSegments: number;
	constructor({
		width = DEFAULT_ANY.width,
		height = DEFAULT_ANY.height,
		depth = DEFAULT_ANY.depth,
		xSegments = DEFAULT_ANY.xSegments,
		ySegments = DEFAULT_ANY.ySegments,
		zSegments = DEFAULT_ANY.zSegments
	}: Any) {
		super('Scoring using a Cartesian mesh geometry');
		this.width = width;
		this.height = height;
		this.depth = depth;
		this.xSegments = xSegments;
		this.ySegments = ySegments;
		this.zSegments = zSegments;
	}
	toJSON(): MeshData {
		return {
			width: this.width,
			height: this.height,
			depth: this.depth,
			xSegments: this.xSegments,
			ySegments: this.ySegments,
			zSegments: this.zSegments
		};
	}
}

export interface ZoneData {
	zoneUuid: string;
}

export class Cyl extends Data<CylData> {
	radius: number;
	innerRadius: number;
	depth: number;
	radialSegments: number;
	zSegments: number;
	constructor({
		radius: radius = DEFAULT_ANY.radius,
		innerRadius = DEFAULT_ANY.innerRadius,
		depth = DEFAULT_ANY.depth,
		radialSegments = DEFAULT_ANY.radialSegments,
		zSegments = DEFAULT_ANY.zSegments
	}: Any) {
		super('Scoring using a cylindrical mesh geometry');
		this.radius = radius;
		this.innerRadius = innerRadius;
		this.depth = depth;
		this.radialSegments = radialSegments;
		this.zSegments = zSegments;
	}
	toJSON(): CylData {
		return {
			radius: this.radius,
			innerRadius: this.innerRadius,
			depth: this.depth,
			radialSegments: this.radialSegments,
			zSegments: this.zSegments
		};
	}
}

export class Zone extends Data<ZoneData> implements ZoneData {
	zoneUuid: string;
	constructor({ zoneUuid = DEFAULT_ANY.zoneUuid }: Any) {
		super('Scoring within one or more zones');
		this.zoneUuid = zoneUuid;
	}
	toJSON(): ZoneData {
		return {
			zoneUuid: this.zoneUuid
		};
	}
}

export type AllData = {
	info?: string;
};

export class All extends Data<AllData> implements AllData {
	constructor(_data: Any) {
		super('Scoring within the entire universe, only useful with certain detectors');
	}
	toJSON(): AllData {
		return {
			info: this.info
		};
	}
}

export type AnyData = MeshData & CylData & ZoneData & AllData;

export type Any = Partial<AnyData>;

export const DEFAULT_ANY: AnyData = {
	width: 1,
	height: 1,
	depth: 1,
	radius: 1,
	innerRadius: 0,
	xSegments: 1,
	ySegments: 1,
	zSegments: 100,
	radialSegments: 1,
	zoneUuid: ''
};

export const DETECTOR_OPTIONS = {
	Mesh: 'Mesh',
	Cyl: 'Cyl',
	Zone: 'Zone',
	All: 'All'
} as const;

export type DETECTOR_TYPE = keyof typeof DETECTOR_OPTIONS;
