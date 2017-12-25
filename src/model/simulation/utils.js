/* @flow */

export type Point = {
  x: number,
  y: number,
  z: number,
}

export type Vec3D = {
  x: number,
  y: number,
  z: number,
}

export type Vec3DCylindrical = {
  radius: number,
  angle: number,
  z: number,
}

export type Range = {
  min: number,
  max: number,
}

export type Particle
  = PredefinedParticle
  | HeavyIon

export type PredefinedParticle = {
  type: string,
}

export type HeavyIon = {
  type: 'heavy_ion',
  charge: number,
  nucleonsCount: number,
}

export type Distribution =
  'flat' | 'gaussian'
