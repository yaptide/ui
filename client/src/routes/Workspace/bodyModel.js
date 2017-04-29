/* @flow */

export type GeometryType = 'sphere' |
  'cuboid' |
  'cylinder';

export type SphereGeometry = {
  type: GeometryType,
  center: Dim,
  radius: number,
};

export type CuboidGeometry = {
  type: GeometryType,
  center: Dim,
  size: Dim,
};

export type CylinderGeometry = {
  type: GeometryType,
  baseCenter: Dim,
  height: number,
  radius: number,
};


export type Dim = {
  x: number,
  y: number,
  z: number,
};
