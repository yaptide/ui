/* @flow */
import * as BodyType from './bodyModel';

export type WorkspaceState = {

};

export type Zone = {
  id: number,
  parentId: number,
  children: Array<number>,
  name: string,
  materialId: number,
  baseId: number,
  construction: Array<Operation>,
};

export type Operation = {
  type: OperationType,
  bodyId: number,
};

export type OperationType = "intersect" |
  "subtract" |
  "union";

export type Body = {
  id: number,
  geometry: ProjectGeometry
};

export type ProjectGeometry = BodyType.SphereGeometry |
  BodyType.CuboidGeometry |
  BodyType.CylinderGeometry;

