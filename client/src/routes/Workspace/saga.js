/* @flow */

import { takeLatest, eventChannel, END } from 'redux-saga';
import { take, select, fork, call, put } from 'redux-saga/effects';
import { Map } from 'immutable';
import api, { endpoint } from 'api';
import router from 'utils/router';
import dialogUtils from 'components/EventElements';
import { toast } from 'react-toastify';
import { actionType } from './reducer';
import { ensureProjects, fetchProjects } from '../Project/saga';

export function* setupWorkspace(
  action: { projectId: string, versionId: number },
): Generator<*, *, *> {
  try {
    const ensureProjectsErr = yield call(ensureProjects);
    if (ensureProjectsErr) {
      throw ensureProjectsErr;
    }
    const {
      versionStatus,
      currentWorkspaceContent,
      currentWorkspaceEdited,
    } = yield select(state => ({
      versionStatus: state.project.getIn(
        ['projects', action.projectId, 'versions', action.versionId, 'status'],
      ),
      currentWorkspaceContent: (
        state.workspace.get('projectId') !== undefined &&
        state.workspace.get('versionId') !== undefined
      ),
      currentWorkspaceEdited: (
        state.workspace.get('updatedAt') &&
        state.workspace.get('updatedAt') !== state.workspace.get('baseUpdatedAt')
      ),
    }));

    if (currentWorkspaceContent && currentWorkspaceEdited) {
      const channel = eventChannel((emitter) => {
        dialogUtils.showAlert(
          'You have unsaved changes.',
          'Workspace has loaded project with unsaved changes. Do you want to save them?',
          [
            { name: 'cancel', action: () => { emitter('cancel'); emitter(END); }, active: false },
            { name: 'discard', action: () => { emitter('discard'); emitter(END); }, active: true },
            { name: 'save', action: () => { emitter('save'); emitter(END); }, active: true },
          ], {
            onClose: () => { emitter('cancel'); emitter(END); },
          },
        );
        return () => null;
      });

      const event = yield take(channel);
      if (event === 'cancel') {
        return undefined;
      } else if (event === 'save') {
        yield call(updateSimulationSetup);
      }
    }

    yield put({
      type: actionType.SETUP_WORKSPACE_SUCCESS,
      projectId: action.projectId,
      versionId: action.versionId,
      viewOnly: versionStatus !== 'new' && versionStatus !== 'edited',
    });
    router.push('/workspace/geometry');
  } catch (error) {
    console.error('assert failure', error, action);
    return error;
  }
  return undefined;
}

export function* fetchSimulationSetup(): Generator<*, *, *> {
  try {
    const { dataStatus, projectId, versionId } = yield select(state => ({
      projectId: state.workspace.get('projectId'),
      versionId: state.workspace.get('versionId'),
      dataStatus: state.workspace.get('dataStatus'),
    }));
    const { updatedAt } = yield select(state => ({
      updatedAt: state.project.getIn(
        ['projects', projectId, 'versions', versionId, 'updatedAt'],
      ),
    }));
    if (dataStatus !== 'none') {
      return;
    }
    yield put({ type: actionType.FETCH_SIMULATION_SETUP_PENDING });
    const response = yield call(api.get, endpoint.simulationSetup(projectId, versionId));
    yield put({
      type: actionType.FETCH_SIMULATION_SETUP_SUCCESS,
      setup: response.data,
      updatedAt,
    });
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
      options: workspace.get('options', Map()).toJS(),
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

export function* startSimulation(): Generator<*, *, *> {
  try {
    const {
      projectId,
      versionId,
      updatedAt,
      baseUpdatedAt,
    } = yield select(state => ({
      projectId: state.workspace.get('projectId'),
      versionId: state.workspace.get('versionId'),
      updatedAt: state.workspace.get('updatedAt'),
      baseUpdatedAt: state.workspace.get('baseUpdatedAt'),
    }));
    if (updatedAt !== baseUpdatedAt) {
      const channel = eventChannel((emitter) => {
        dialogUtils.showAlert(
          'Do you want to save changes?',
          'You have local unsaved changes. Do you want to save before simulation start.',
          [
            { name: 'cancel', action: () => { emitter(false); emitter(END); }, active: false },
            { name: 'save', action: () => { emitter(true); emitter(END); }, active: true },
          ],
        );
        return () => null;
      });
      const overrideChanges = yield take(channel);
      if (overrideChanges === true) {
        yield call(updateSimulationSetup);
      }
    }
    yield put({ type: actionType.START_SIMULATION_PENDING });
    try {
      yield call(api.post, endpoint.SIMULATION_RUN, {
        projectId, versionId: String(versionId),
      });
    } catch (error) {
      if (error && error.response && error.response.data) {
        toast.error(`Unable to start simulaion\nReason: ${JSON.stringify(error.response.data)}`);
      }
      yield call(fetchProjects);
      yield put({ type: actionType.START_SIMULATION_ERROR, error });
      return error;
    }
    yield put({ type: actionType.START_SIMULATION_SUCCESS });
    router.push(`/project/${projectId}`);
    yield call(fetchProjects);
  } catch (error) {
    yield call(fetchProjects);
    yield put({ type: actionType.START_SIMULATION_ERROR, error });
    return error;
  }
  return undefined;
}

export function* watchFetchSimulationSetup(): Generator<*, *, *> {
  yield call(takeLatest, actionType.FETCH_SIMULATION_SETUP, fetchSimulationSetup);
}

export function* watchUpdateSimulationSetup(): Generator<*, *, *> {
  yield call(takeLatest, actionType.SYNC_WORKSPACE_WITH_SERVER, updateSimulationSetup);
}

export function* watchStartSimulation(): Generator<*, *, *> {
  yield call(takeLatest, actionType.START_SIMULATION, startSimulation);
}

export function* watchSetupWorkspace(): Generator<*, *, *> {
  yield call(takeLatest, actionType.SETUP_WORKSPACE, setupWorkspace);
}


export default function* workspaceSaga(): Generator<*, *, *> {
  yield [
    fork(watchFetchSimulationSetup),
    fork(watchUpdateSimulationSetup),
    fork(watchStartSimulation),
    fork(watchSetupWorkspace),
  ];
}
