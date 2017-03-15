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
  versionIndices: Array<string>,
};

export type ProjectDetails = {
  id: string,
  name: string,
  description: string,
  versions: Array<Version>,
}

export type Version = {
  id: number,
  setupId: string,
  resultsId: string,
  settings: Settings,
  status: SimulationStatus,
}

export type Settings = {
  library: SimulationLibrary,
  engine: ComputeEngine,
}

export type SimulationStatus = 'current' | // local changes
  'success' | // last simulation finished without errors
  'error' | // simulation tun unsucessful
  'inprogress' | // simulation is in progress
  'none'; // there was no build or any changes in this version

export type SimulationLibrary = 'shield';
export type ComputeEngine = 'local' | 'plgrid';

