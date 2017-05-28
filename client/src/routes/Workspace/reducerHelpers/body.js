/* @flow */

import { Map, fromJS } from 'immutable';
import type { Body, ConstructionPath } from '../model';
// import { withMutations } from './utils';

export function createBodyInZone(
  oldState: Map<string, any>,
  body: Body,
  constructionPath: ConstructionPath,
): Map<string, any> {
  let state = oldState;
  const bodies = state.get('bodies');
  const newBodyId: number = 1 + bodies.reduce((acc, val) => (val.get('id') > acc ? val.get('id') : acc), 0);

  const newBody = fromJS(body).merge({ id: newBodyId });

  state = state.setIn(['bodies', String(newBodyId)], newBody);
  if (constructionPath.base) {
    state = state.setIn(['zones', String(constructionPath.zoneId), 'baseId'], newBodyId);
  } else if (constructionPath.construction !== undefined) {
    state = state.updateIn(['zones', String(constructionPath.zoneId), 'construction'],
      construction => construction.insert(constructionPath.construction, fromJS({ type: 'subtract', bodyId: newBodyId })),
    );
  }
  return state;
}

export function deleteBodyInZone(
  oldState: Map<string, any>, bodyId: number, constructionPath: ConstructionPath,
): Map<string, any> {
  let state = oldState;
  state = state.deleteIn(['bodies', String(bodyId)]);
  if (constructionPath.construction) {
    state = state.updateIn(['zones', String(constructionPath.zoneId), 'construction', constructionPath.construction]);
  }
  return state;
}

export function updateBody(state: Map<string, any>, body: Body) {
  return state.setIn(['bodies', String(body.id)], fromJS(body));
}

export default {
  createInZone: createBodyInZone,
  deleteInZone: deleteBodyInZone,
  update: updateBody,
};
