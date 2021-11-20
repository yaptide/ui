import CSG from '../js/libs/csg/three-csg';

const OPERATION = ['intersection', 'left-subtraction', 'right-subtraction', 'union'] as const;
const METHOD = [
	(csg: CSG) => (object: CSG) => csg.intersect(object),
	(csg: CSG) => (object: CSG) => csg.subtract(object),
	(csg: CSG) => (object: CSG) => object.subtract(csg),
	(csg: CSG) => (object: CSG) => csg.union(object)
] as const;

export type Operation = typeof OPERATION[number];

export const isOperation = (x: unknown): x is Operation => OPERATION.includes(x as Operation);

export const executeOperation = (operation: Operation) => METHOD[OPERATION.indexOf(operation)];
