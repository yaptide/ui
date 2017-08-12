/* @flow */

import { Map } from 'immutable';

import * as _ from 'lodash';
import type { ResultsState } from './model';

export const actionType = {
  FETCH_SIMULATION_RESULTS: 'FETCH_SIMULATION_RESULTS',
  FETCH_SIMULATION_RESULTS_PENDING: 'FETCH_SIMULATION_RESULTS_PENDING',
  FETCH_SIMULATION_RESULTS_SUCCESS: 'FETCH_SIMULATION_RESULTS_SUCCESS',
  FETCH_SIMULATION_RESULTS_ERROR: 'FETCH_SIMULATION_RESULTS_ERROR',
};

const ACTION_HANDLERS = {
  [actionType.FETCH_SIMULATION_RESULTS_PENDING]: (state, action) => (
    state.merge({
      projectId: action.projectId,
      versionId: action.versionId,
      dataStatus: 'pending',
    })
  ),
  [actionType.FETCH_SIMULATION_RESULTS_SUCCESS]: (state, action) => {
    const { detectors, results } = action.results;
    const detectorIds = _.map(detectors, item => item.metadata.filename);

    const detectorsMap = _.keyBy(detectors, item => item.metadata.filename);
    const detectorsProcessed = _.mapValues(detectorsMap, (item) => {
      const { scored, ...rest } = item;
      return rest;
    });
    const detectorsScore = _.mapValues(detectorsMap, item => item.scored);

    return state.merge({
      ...results,
      detectorIds,
      detectors: detectorsProcessed,
      detectorsScore,
      dataStatus: 'success',
    });
  },
  [actionType.FETCH_SIMULATION_RESULTS_ERROR]: (state, action) => (
    state.merge({ isResultFetchPending: false, error: action.error })
  ),
};

export const actionCreator = {
  fetchResuts(projectId: String, versionId: String) {
    return { type: actionType.FETCH_SIMULATION_RESULTS, projectId, versionId };
  },
};

const initialState = Map();
export const reducer = (state: ResultsState = initialState, action: { type: string }) => {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
};
