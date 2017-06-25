/* @flow */

import { Map, List, fromJS } from 'immutable';
import type { ConstructionPath, OperationType } from 'model/simulation/zone';
// import { withMutations } from './utils';

export function createZone(state: Map<string, any>) {
  const zones: List<any> = state.get('zones');
  const newZoneId: number = 1 + zones.reduce((acc, val) => (val.get('id') > acc ? val.get('id') : acc), 0);

  const newZone = fromJS({
    id: newZoneId,
    parentId: state.get('zoneLayerParent'),
    children: [],
    materialId: 2,
    name: 'Unnamed zone',
    construction: [],
  });

  return state.setIn(['zones', String(newZoneId)], newZone);
}

export function deleteZone(oldState: Map<string, any>, zoneId: number) {
  let state = oldState;
  const zone = state.getIn(['zones', String(zoneId)]);
  if (!zone) return state;

  zone.getIn(['children'], []).forEach((item) => {
    state = deleteZone(state, item.get('id'));
  });
  state = state.deleteIn(['bodies', String(zone.get('baseId'))]);
  zone.get('construction', []).forEach((item) => {
    state = state.deleteIn(['bodies', String(item.get('bodyId'))]);
  });
  // TODO: remove materials
  return state;
}

export function changeZoneOperationType(
  oldState: Map<string, any>,
  newVal: OperationType,
  path: ConstructionPath,
): Map<string, any> {
  let state = oldState;
  if (path.baseId || path.construction === undefined) return state;

  state = state.setIn(
    ['zones', String(path.zoneId), 'construction', path.construction, 'type'],
    newVal,
  );
  return state;
}

export function createZoneOperation(
  oldState: Map<string, any>,
  path: ConstructionPath,
): Map<string, any> {
  let state = oldState;

  if (path.baseId || path.construction === undefined) return state;

  state = state.updateIn(
    ['zones', String(path.zoneId), 'construction'],
    construction => construction.insert(path.construction, fromJS({
      type: 'subtract',
      bodyId: undefined,
    })),
  );
  return state;
}

export function deleteZoneOperation(
  oldState: Map<string, any>,
  path: ConstructionPath,
): Map<string, any> {
  let state = oldState;

  if (path.baseId || path.construction === undefined) return state;
  const bodyId = state.getIn(
    ['zones', String(path.zoneId), 'construction', path.construction, 'bodyId'],
  );
  if (bodyId !== undefined) {
    state = state.deleteIn(['bodies', String(bodyId)]);
  }

  state = state.deleteIn(
    ['zones', String(path.zoneId), 'construction', path.construction],
  );
  return state;
}

export default {
  create: createZone,
  delete: deleteZone,
  changeOperationType: changeZoneOperationType,
  createOperation: createZoneOperation,
  deleteOperation: deleteZoneOperation,
};
