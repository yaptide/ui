import CSG from '../ThreeEditor/js/libs/csg/three-csg';

export const OPERATION = ['intersection', 'subtraction', 'reverse-subtraction', 'union'] as const;
export const METHOD = [
	(csg: CSG) => (object: CSG) => csg.intersect(object),
	(csg: CSG) => (object: CSG) => csg.subtract(object),
	(csg: CSG) => (object: CSG) => object.subtract(csg),
	(csg: CSG) => (object: CSG) => csg.union(object)
] as const;

export type Operation = (typeof OPERATION)[number];

export type OperationData = {
	operation: Operation;
	objectId: number | null;
};

type UnionData = { operation: 'union'; objectId: number | null };

export type OperationDataList = [UnionData, ...OperationData[]];

export const isOperation = (x: unknown): x is Operation => OPERATION.includes(x as Operation);

export const executeOperation = (operation: Operation) => METHOD[OPERATION.indexOf(operation)];
