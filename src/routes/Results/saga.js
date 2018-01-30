/* @flow */

import { takeLatest } from 'redux-saga';
import { select, fork, call, put } from 'redux-saga/effects';
import api, { endpoint } from 'api';
import { actionType } from './reducer';

export function* fetchSimulationResults(
  action: {projectId: string, versionId: number},
): Generator<*, *, *> {
  try {
    const { dataStatus, projectId, versionId } = yield select(state => ({
      projectId: state.results.get('projectId'),
      versionId: state.results.get('versionId'),
      dataStatus: state.results.get('dataStatus'),
    }));
    if (dataStatus !== 'none'
      && projectId === action.projectId
      && versionId === action.versionId
    ) {
      return;
    }
    yield put({
      type: actionType.FETCH_SIMULATION_RESULTS_PENDING,
      projectId: action.projectId,
      versionId: action.versionId,
    });
    const results = yield call(
      api.get,
      endpoint.simulationResults(action.projectId, action.versionId),
    );
    const setup = yield call(
      api.get,
      endpoint.simulationSetup(action.projectId, action.versionId),
    );
    yield put({
      type: actionType.FETCH_SIMULATION_RESULTS_SUCCESS,
      setup: setup.data,
      results: results.data,
    });
  } catch (error) {
    yield put({ type: actionType.FETCH_SIMULATION_RESULTS_ERROR, error: error.response.data });
  }
}


export function* watchFetchSimulationResults(): Generator<*, *, *> {
  yield call(takeLatest, actionType.FETCH_SIMULATION_RESULTS, fetchSimulationResults);
}

export default function* resultsSaga(): Generator<*, *, *> {
  yield [
    fork(watchFetchSimulationResults),
  ];
}
