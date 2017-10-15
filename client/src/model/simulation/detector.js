/* @flow */

import type {
  Point,
  Vec3D,
  Vec3DCylindrical,
  Range,
} from './utils';

export type Detector = {
  id: number,
  name: string,
  detectorGeometry: DetectorGeometry,
  particle: ScoredParticle,
  scoring: ScoringType,
}

export type DetectorGeometry
  = Geomap
  | Cylinder
  | Mesh
  | Plane
  | Zone

export type ScoredParticle
  = PredefinedParticle
  | HeavyIon

export type ScoringType
  = PredefinedScoringType
  | LetTypeScoring

export type Geomap = {
  type: 'geomap',
  center: Point,
  size: Vec3D,
  slices: Vec3D,
}

export type Cylinder = {
  type: 'cylinder',
  radius: Range,
  zValue: Range,
  angle: Range,
  slices: Vec3DCylindrical,
}

export type Mesh = {
  type: 'mesh',
  center: Point,
  size: Vec3D,
  slices: Vec3D,
}

export type Zone = {
  type: 'zone',
  zones: Array<number>,
}

export type Plane = {
  type: 'plane',
  point: Point,
  normal: Vec3D,
}

export type PredefinedParticle = {
  type: string,
}

export type HeavyIon = {
  type: 'heavy_ion',
  charge: number,
  nucleonsCount: number,
}

export type PredefinedScoringType = {
  type: string,
}

export type LetTypeScoring = {
  type: string,
  material: string,
}

