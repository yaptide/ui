/* @flow */

import type { Point, Vec3D } from './utils';

export type GeometryType = 'sphere' |
  'cuboid' |
  'cylinder';

export type SphereGeometry = {
  type: 'sphere',
  center: Point,
  radius: number,
};

export type CuboidGeometry = {
  type: 'cuboid',
  center: Point,
  size: Vec3D,
};

export type CylinderGeometry = {
  type: 'cylinder',
  baseCenter: Point,
  height: number,
  radius: number,
};

