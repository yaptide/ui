/* @flow */

export type GeometryType = 'sphere' |
  'cuboid' |
  'cylinder';

export type SphereGeometry = {
  type: 'sphere',
  center: Dim,
  radius: number,
};

export type CuboidGeometry = {
  type: 'cuboid',
  center: Dim,
  size: Dim,
};

export type CylinderGeometry = {
  type: 'cylinder',
  baseCenter: Dim,
  height: number,
  radius: number,
};


export type Dim = {
  x: number,
  y: number,
  z: number,
};
