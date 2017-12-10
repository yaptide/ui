/* @flow */

import { Map, List } from 'immutable';

export type ProjectState = Map<
  'projectIndices' |
  'projects'
  ,
  List<number> |
  Map<number, Object>
  >;

export type Project = {
  id: string,
  name: string,
  description: string,
  versionIds: Array<number>,
  versions: Array<Version>,
};

export type Version = {
  id: number,
  setupId: string,
  resultsId: string,
  settings: Settings,
  status: SimulationStatus,
}

export type Settings = {
  computingLibrary: ComputingLibrary,
  simulationEngine: SimulationEngine,
}

export type SimulationStatus = 'curre' | // local changes
  'new' |
  'edited' |
  'running' |
  'pending' |
  'success' |
  'failure' |
  'interrupted' |
  'canceled' |
  'discarded'

export type ComputingLibrary = 'shield' | '';
export type SimulationEngine = 'local' | 'plgrid' | '';

