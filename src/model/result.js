/* @flow */

import { Map } from 'immutable';

export type ResultsState = Map<string, any>;

export type DetectorResultId = string

export type Results = {
  detectorIds: Array<DetectorResultId>,
  detectors: {[DetectorResultId]: DetectorResultsInfo},
  detectorsScore: {[DetectorResultId]: Score},
}

export type DetectorResultsInfo = {
  metadata: {[string]: string},
  dimensions: DimensionsInfo,
}

export type Score = Array<Array<Array<number>>>;

export type DimensionsInfo = {
  numberOfDimensions: number,
  segmentsInDim1: number,
  segmentsInDim2: number,
  segmentsInDim3: number,
  coordinatesType: CoordiantesType,
}

export type CoordiantesType =
  'cartesian' |
  'spherical';
