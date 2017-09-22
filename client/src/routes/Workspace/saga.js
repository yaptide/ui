/* @flow */

import { takeLatest } from 'redux-saga';
import { select, fork, call, put } from 'redux-saga/effects';
import { Map } from 'immutable';
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

export function* updateSimulationSetup(): Generator<*, *, *> {
  try {
    const { projectId, versionId, workspace } = yield select(state => ({
      projectId: state.workspace.get('projectId'),
      versionId: state.workspace.get('versionId'),
      workspace: state.workspace,
    }));
    if (!projectId || versionId === undefined) {
      return;
    }
    const setup = {
      zones: workspace.get('zones', Map()).toJS(),
      bodies: workspace.get('bodies', Map()).toJS(),
      materials: workspace.get('materials', Map()).toJS(),
      detectors: workspace.get('detectors', Map()).toJS(),
      beam: workspace.get('beam', Map()).toJS(),
    };
    yield call(
      api.put,
      endpoint.simulationSetup(projectId, versionId),
      setup,
    );
    yield put({ type: actionType.UPDATE_SIMULATION_SETUP_SUCCESS });
  } catch (error) {
    yield put({
      type: actionType.UPDATE_SIMULATION_SETUP_ERROR,
      error: error.response || error.response.data,
    });
  }
}


export function* watchFetchSimulationSetup(): Generator<*, *, *> {
  yield call(takeLatest, actionType.FETCH_SIMULATION_SETUP, fetchSimulationSetup);
}

export function* watchUpdateSimulationSetup(): Generator<*, *, *> {
  yield call(takeLatest, actionType.SYNC_WORKSPACE_WITH_SERVER, updateSimulationSetup);
}

export default function* workspaceSaga(): Generator<*, *, *> {
  yield [
    fork(watchFetchSimulationSetup),
    fork(watchUpdateSimulationSetup),
  ];
}
