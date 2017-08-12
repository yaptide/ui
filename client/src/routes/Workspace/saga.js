/* @flow */

import { takeLatest } from 'redux-saga';
import { select, fork, call, put } from 'redux-saga/effects';
import api, { endpoint } from 'api';
import { actionType } from './reducer';

export function* fetchSimulationSetup(): Generator<*, *, *> {
  try {
    const { dataStatus, projectId, versionId } = yield select(state => ({
      projectId: state.workspace.get('projectId'),
      versionId: state.workspace.get('versionId'),
      dataStatus: state.workspace.get('dataStatus'),
    }));
    if (dataStatus !== 'pendingReducer') {
      return;
    }
    yield put({ type: actionType.FETCH_SIMULATION_SETUP_PENDING });
    const response = yield call(api.get, endpoint.simulationSetup(projectId, versionId));
    yield put({ type: actionType.FETCH_SIMULATION_SETUP_SUCCESS, geometry: response.data });
  } catch (error) {
    yield put({ type: actionType.FETCH_SIMULATION_SETUP_ERROR, error: error.response.data });
  }
}


export function* watchFetchSimulationSetup(): Generator<*, *, *> {
  yield call(takeLatest, actionType.FETCH_SIMULATION_SETUP, fetchSimulationSetup);
}

export default function* workspaceSaga(): Generator<*, *, *> {
  yield [
    fork(watchFetchSimulationSetup),
  ];
}
