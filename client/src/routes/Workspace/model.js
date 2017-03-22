/* @flow */

export type WorkspaceState = {

};

export type Zone = {
  id: number,
  name: string,
  materialId: number,
  baseId: number,
  construction: Array<Operation>,
}

export type Operation = {
  type: OperationType,
  bodyId: number,
}

export type OperationType = "intersect" |
  "subtract" |
  "union";
