/* @flow */

import { fromJS } from 'immutable';

import type { WorkspaceState } from './model';
import stateProcessor from './reducerHelpers';

export const actionType = {
  SYNC_WORKSPACE_WITH_SERVER: 'SYNC_WORKSPACE_WITH_SERVER',

  CREATE_ZONE: 'CREATE_ZONE',
  DELETE_ZONE: 'DELETE_ZONE',

  CREATE_BODY_IN_ZONE: 'CREATE_BODY_IN_ZONE',
  DELETE_BODY_IN_ZONE: 'DELETE_BODY_IN_ZONE',

  UPDATE_BODY: 'UPDATE_BODY',

  CREATE_MATERIAL: 'CREATE_MATERIAL',
  DELETE_MATERIAL: 'DELETE_MATERIAL',
  UPDATE_MATERIAL: 'UPDATE_MATERIAL',

};

const ACTION_HANDLERS = {
  [actionType.CREATE_ZONE]: (state, action) => stateProcessor.zone.create(state, action.zone),
  [actionType.DELETE_ZONE]: (state, action) => stateProcessor.zone.delete(state, action.zoneId),
  [actionType.CREATE_BODY_IN_ZONE]: (state, action) => (
    stateProcessor.body.createInZone(state, action.body, action.zoneConstructionPath)
  ),
  [actionType.DELETE_BODY_IN_ZONE]: (state, action) => (
    stateProcessor.body.deleteInZone(state, action.bodyId, action.zoneConstructionPath)
  ),
};

export const actionCreator = {
};

const initialState = fromJS({
  zones: {
    '1': {
      id: 1,
      name: 'zone 1',
      parentId: 1,
      children: [],
      materialId: 1,
      baseId: 1,
      construction: [
        { type: 'subtract', bodyId: 2 },
      ],
    },
    '2': {
      id: 2,
      name: 'zone 2',
      parentId: 2,
      children: [],
      materialId: 2,
      baseId: 3,
      construction: [
        { type: 'union', bodyId: 4 },
      ],
    },
  },
  bodies: {
    '1': {
      id: 1,
      geometry: {
        type: 'sphere',
        center: { x: 5, y: 5, z: 5 },
        radius: 3,
      },
    },
    '2': {
      id: 2,
      geometry: {
        type: 'cylinder',
        height: 10,
        baseCenter: { x: 5, y: 0, z: 5 },
        radius: 1,
      },
    },
    '3': {
      id: 3,
      geometry: {
        type: 'cylinder',
        height: 20,
        baseCenter: { x: -10, y: 0, z: 10 },
        radius: 3,
      },
    },
    '4': {
      id: 4,
      geometry: {
        type: 'cuboid',
        center: { x: -10, y: -3, z: 10 },
        size: { x: 20, y: 6, z: 20 },
      },
    },
  },
});
export const reducer = (state: WorkspaceState = initialState, action: { type: string }) => {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
};
