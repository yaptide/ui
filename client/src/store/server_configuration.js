/* @flow */

import { fromJS } from 'immutable';
import { delay } from 'redux-saga';
import router from 'utils/router';
import { call, put } from 'redux-saga/effects';
import api, { endpoint } from 'api';
import * as _ from 'lodash';

const actionType = {
  FETCH_SERVER_CONFIGURATION: 'FETCH_SERVER_CONFIGURATION',
  FETCH_SERVER_CONFIGURATION_SUCCESS: 'FETCH_SERVER_CONFIGURATION_SUCCESS',
  FETCH_SERVER_CONFIGURATION_ERROR: 'FETCH_SERVER_CONFIGURATION_ERROR',
};

const ACTION_HANDLERS = {
  [actionType.FETCH_SERVER_CONFIGURATION]: (state) => {
    return state.merge({ isConfigFetchPending: true });
  },
  [actionType.FETCH_SERVER_CONFIGURATION_SUCCESS]: (state, action) => {
    return state.merge({
      predefinedMaterials: _.keyBy(action.config.predefinedMaterials, item => item.value),
      predefinedMaterialsOrder: _.map(action.config.predefinedMaterials, item => item.value),
      isotopes: _.keyBy(action.config.isotopes, item => item.value),
      isotopesOrder: _.map(action.config.isotopes, item => item.value),
      isConfigFetchPending: false,
      fetchConfigError: undefined,
    });
  },
  [actionType.FETCH_SERVER_CONFIGURATION_ERROR]: (state, action) => {
    return state.merge({ isConfigFetchPending: false, fetchConfigError: action.error });
  },
};

export function* configurationSaga(): Generator<*, *, *> {
  for (;;) {
    try {
      const response = yield call(api.get, endpoint.CONFIGURATION);
      yield put({ type: actionType.FETCH_SERVER_CONFIGURATION_SUCCESS, config: response.data });
      return;
    } catch (error) {
      yield put({ type: actionType.FETCH_SERVER_CONFIGURATION_ERROR, error: error.response.data });
      yield call(delay, 1000);
      yield call(router.push, 'unable_to_read_configuration');
    }
  }
}

const initialState = fromJS({});
export const reducer = (state: Map<string, any> = initialState, action: { type: string }) => {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
};
