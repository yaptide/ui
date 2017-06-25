/* @flow */

import { Map, fromJS } from 'immutable';
import type { Body, ConstructionPath } from 'model/simulation/zone';
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
    state = state.setIn(
      ['zones', String(constructionPath.zoneId), 'baseId'],
      newBodyId,
    );
  } else if (constructionPath.construction !== undefined) {
    state = state.setIn(
      [
        'zones',
        String(constructionPath.zoneId),
        'construction',
        constructionPath.construction,
        'bodyId',
      ],
      newBodyId,
    );
  }
  return state;
}


export function updateBody(state: Map<string, any>, body: Body) {
  return state.setIn(['bodies', String(body.id)], fromJS(body));
}

export default {
  createInZone: createBodyInZone,
  update: updateBody,
};
