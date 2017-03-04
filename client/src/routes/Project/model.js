/* @flow */

import { Map, List } from 'immutable';

export type ProjectState = Map<
  'projectIndices' |
  'projects'
  ,
  List<number> |
  Map<number, Project>
  >;

export type Project = Map<
  'id' |
  'name' |
  'description' |
  'versionIndices' |
  number
  ,
  number |
  string |
  List<number> |
  Version
  >;

export type Version = Map<
  'id' |
  'setupId' |
  'resultsId' |
  'settings'
  ,
  number,
  Settings,
  >

export type Settings = Map<
  'library' |
  'engine'
  ,
  SimulationLibrary |
  ComputeEngine
  >

export type SimulationLibrary = 'shield';
export type ComputeEngine = 'local'

