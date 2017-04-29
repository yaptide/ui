/* @flow */

import { fromJS } from 'immutable';

import type { WorkspaceState } from './model';

export const actionType = {

};

const ACTION_HANDLERS = {
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
