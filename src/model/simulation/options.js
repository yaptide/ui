/* @flow */

export type SimulationOptions = {
  antyparticleCorrectionOn: bool,
  nuclearReactionsOn: bool,
  meanEnergyLoss: number,
  minEnergyLoss: number,
  scatteringType: ScatteringType,
  energyStraggling: EnergyStragglingType,
  fastNeutronTransportOn: bool,
  lowEnergyNeutronCutOff: number,
  recordSecondaryNeutronCreation: bool,
  numberOfGeneratedParticles: number,
};

export type ScatteringType =
  'gaussian' | 'moliere'

export type EnergyStragglingType =
  'vavilov' | 'gaussian'
