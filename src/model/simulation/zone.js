/* @flow */

import * as BodyType from './body';


export type Zone = {
  id: number,
  parentId: number,
  children: Array<number>,
  name: string,
  materialId: number,
  baseId: number,
  construction: Array<Operation>,
};

export type PrintableZone = {
  id: number,
  parentId: number,
  children: Array<number>,
  name: string,
  materialId: number,
  base: { label: string, bodyId: number },
  construction: Array<PrintableOperation>,
}

export type Operation = {
  type: OperationType,
  bodyId: number,
};

export type PrintableOperation = {
  type: OperationType,
  body: { label: string, bodyId: number },
};

export type OperationType = "intersect" |
  "subtract" |
  "union";

export type Body = {
  id: number,
  geometry: BodyGeometry
};

export type BodyGeometry = BodyType.SphereGeometry |
  BodyType.CuboidGeometry |
  BodyType.CylinderGeometry;


export type ConstructionPath = {
  zoneId?: number,
  baseId?: bool,
  construction?: number,
}
