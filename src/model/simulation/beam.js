/* @flow */

import type { Point, Particle, Distribution } from './utils';

export type Beam = {
  direction: Direction,
  divergence: Divergence,
  particleType: Particle,
  initialBaseEnergy: number,
  initialEnergySigma: number,
}

export type Direction = {
  phi: number,
  theta: number,
  position: Point,
}

export type Divergence = {
    sigmaX: number,
    sigmaY: number,
    distribution: Distribution,
}

