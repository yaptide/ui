/* @flow */

import { Map, List, fromJS } from 'immutable';
import type { Zone } from '../model';
// import { withMutations } from './utils';

export function createZone(state: Map<string, any>, zone: Zone) {
  const zones: List<any> = state.get('zones');
  const newZoneId: number = 1 + zones.reduce((acc, val) => (val.get('id') > acc ? val.get('id') : acc), 0);

  const newZone = fromJS(zone).merge({ id: newZoneId });

  return state.setIn(['zones', String(newZoneId)], newZone);
}

export function deleteZone(oldState: Map<string, any>, zoneId: number) {
  let state = oldState;
  const zone = state.getIn(['zones', String(zoneId)]);
  if (!zone) {
    return state;
  }

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

export default {
  create: createZone,
  delete: deleteZone,
};
