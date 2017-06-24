/* @flow */

import { Map, fromJS } from 'immutable';
import type { ConstructionPath, Body } from 'model/simulation/zone';
import serializer from './bodySerializer';

function visualisationSelector(state: { workspace: Map<string, mixed> }) {
  return state.workspace;
}

function allZonesIds(state: { workspace: Map<string, any> }) {
  return state.workspace
    .get('zones', Map())
    .valueSeq()
    .map(item => item.get('id'));
}

function zoneById(state: { workspace: Map<string, any> }, zoneId: number): Map<string, any> {
  return state.workspace.getIn(['zones', String(zoneId)], Map());
}

function bodyById(state: { workspace: Map<string, any> }, zoneId: number): Map<string, any> {
  return state.workspace.getIn(['bodies', String(zoneId)], Map());
}

function materialById(state: { workspace: Map<string, any> }, zoneId: number): Map<string, any> {
  return state.workspace.getIn(['materials', String(zoneId)], Map());
}

function zoneByIdPrintable(
  state: { workspace: Map<string, any> },
  zoneId: number,
): Map<string, any> {
  let zone = zoneById(state, zoneId);

  const baseBody = bodyById(state, zone.get('baseId')).toJS();
  zone = zone.set('base', fromJS({ bodyId: zone.get('baseId'), label: serializer(baseBody) }));
  zone.get('construction').forEach((item, index) => {
    const body: Body = bodyById(state, item.get('bodyId')).toJS();
    zone = zone.setIn(['construction', index, 'body'], fromJS({ bodyId: item.get('bodyId'), label: serializer(body) }));
  });
  return zone;
}

function bodyByConstructionPath(state: { workspace: Map<string, mixed> }, path: ConstructionPath) {
  if (!path) { return Map(); }
  const workspace = state.workspace;
  const bodyId = workspace.getIn([
    'zones',
    String(path.zoneId),
    ...(path.base ? ['baseId'] : ['construction', path.construction, 'bodyId']),
  ]);
  const body = workspace.getIn(['bodies', String(bodyId)], Map());
  return body;
}

export default {
  visualisationSelector,
  bodyByConstructionPath,
  allZonesIds,
  zoneById,
  bodyById,
  materialById,
  zoneByIdPrintable,
};
