import expect from 'expect';
import { fromJS } from 'immutable';

import stateProcessor from '../../../src/routes/Workspace/reducerHelpers';

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

describe('Operations on workspace state', () => {
  it('Create new zone', () => {
    const newZone = { name: 'Unnamed zone', parentId: 3, children: [], construction: [] };
    const expectedState = initialState
      .setIn(['zones', '3'], fromJS({ ...newZone, id: 3 }));
    const newState = stateProcessor.zone.create(initialState, newZone);
    expect(newState.toJS()).toEqual(expectedState.toJS());
  });
  it('Add new body to zone (first in construction)', () => {
    const newBody = { someValue: 'someValue' };
    const expectedState = initialState
      .setIn(['bodies', '5'], fromJS({ ...newBody, id: 5 }))
      .updateIn(
        ['zones', '2', 'construction'],
        construction => construction.insert(0, fromJS({ type: 'subtract', bodyId: 5 })),
      );

    let newState = stateProcessor.zone.createOperation(
      initialState, { zoneId: 2, construction: 0 },
    );
    newState = stateProcessor.body.createInZone(
      newState,
      newBody,
      { zoneId: 2, construction: 0 },
    );
    expect(newState.toJS()).toEqual(expectedState.toJS());
  });

  it('Add new body to zone (append to end)', () => {
    const newBody = { someValue: 'someValue' };
    const expectedState = initialState
      .setIn(['bodies', '5'], fromJS({ ...newBody, id: 5 }))
      .updateIn(
        ['zones', '2', 'construction'],
        construction => construction.insert(1, fromJS({ type: 'subtract', bodyId: 5 })),
      );

    let newState = stateProcessor.zone.createOperation(
      initialState, { zoneId: 2, construction: 1 },
    );
    newState = stateProcessor.body.createInZone(
      newState,
      newBody,
      { zoneId: 2, construction: 1 },
    );
    expect(newState.toJS()).toEqual(expectedState.toJS());
  });

  it('Add new body to empty construction', () => {
    const newBody = { someValue: 'someValue' };
    const newInitialState = initialState
      .setIn(['zones', '2', 'construction'], fromJS([]));
    const expectedState = newInitialState
      .setIn(['bodies', '5'], fromJS({ ...newBody, id: 5 }))
      .updateIn(
        ['zones', '2', 'construction'],
        construction => construction.insert(0, fromJS({ type: 'subtract', bodyId: 5 })),
      );
    let newState = stateProcessor.zone.createOperation(
      newInitialState, { zoneId: 2, construction: 0 },
    );
    newState = stateProcessor.body.createInZone(
      newState,
      newBody,
      { zoneId: 2, construction: 0 },
    );
    expect(newState.toJS()).toEqual(expectedState.toJS());
  });
});
