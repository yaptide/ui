/* @flow */

import { takeLatest, delay } from 'redux-saga';
import { fork, call, put, select } from 'redux-saga/effects';
import api, { endpoint } from 'api';
import router from 'utils/router';
import type { Project, Settings } from 'model/project';
import { List, Map } from 'immutable';
import { actionType } from './reducer';

export function* ensureProjects(): Generator<*, *, *> {
  const projects = yield select(store => store.project.get('projects'));
  if (!projects) {
    yield call(fetchProjects);
  }
}

export function* fetchProjects(): Generator<*, *, *> {
  try {
    yield put({ type: actionType.FETCH_PROJECTS_PENDING });
    const response = yield call(api.get, endpoint.PROJECT);
    const projects = response.data ? response.data.projects : [];
    projects.reverse();
    yield put({ type: actionType.FETCH_PROJECTS_SUCCESS, projects });
  } catch (error) {
    yield put({ type: actionType.FETCH_PROJECTS_ERROR, error: error.response.data });
  }
}

export function* createNewProject(action: { project: Project }): Generator<*, *, *> {
  try {
    yield call(api.post, endpoint.PROJECT, action.project);
    yield put({ type: actionType.CREATE_NEW_PROJECT_SUCCESS });
    yield call(fetchProjects);
    yield call(router.push, 'project/list');
  } catch (error) {
    yield put({ type: actionType.CREATE_NEW_PROJECT_ERROR, error: error.response.data });
  }
}

export function* updateProject(
  action: { project: Project, projectId: string },
): Generator<*, *, *> {
  try {
    yield call(api.put, endpoint.projectById(action.projectId), action.project);
    yield put({ type: actionType.UPDATE_PROJECT_SUCCESS });
    yield call(fetchProjects);
    yield call(router.push, 'project/list');
  } catch (error) {
    yield put({ type: actionType.UPDATE_PROJECT_ERROR, error: error.response.data });
  }
}

export function* createNewVersion(action: { projectId: string }): Generator<*, *, *> {
  try {
    yield call(api.post, endpoint.versionByProjectId(action.projectId));
    yield put({ type: actionType.CREATE_NEW_VERSION_SUCCESS });
    yield call(fetchProjects);
    yield call(router.push, `project/${action.projectId}`);
  } catch (error) {
    yield put({ type: actionType.CREATE_NEW_VERSION_ERROR, error: error.response.data });
  }
}

export function* createNewVersionFrom(
  action: { projectId: string, versionId: number },
): Generator<*, *, *> {
  try {
    yield call(
      api.post,
      endpoint.versionByProjectIdFromVersionId(action.projectId, action.versionId),
    );
    yield put({ type: actionType.CREATE_NEW_VERSION_FROM_SUCCESS });
    yield call(fetchProjects);
    yield call(router.push, `project/${action.projectId}`);
  } catch (error) {
    yield put({ type: actionType.CREATE_NEW_VERSION_FROM, error: error.response.data });
  }
}

export function* startSimulation(
  action: { projectId: string, versionId: number },
): Generator<*, *, *> {
  try {
    yield call(api.post, endpoint.SIMULATION_RUN, {
      projectId: action.projectId, versionId: String(action.versionId),
    });
    yield put({ type: actionType.START_SIMULATION_SUCCESS });
    yield call(fetchProjects);
  } catch (error) {
    yield put({ type: actionType.START_SIMULATION_ERROR, error: error.response.data });
  }
}

export function* updateVersionSettings(
  action: { settings: Settings, projectId: string, versionId: number },
): Generator<*, *, *> {
  try {
    const { versionId, projectId, settings } = action;
    yield call(api.put, endpoint.version(projectId, versionId), { settings });
    yield put({ type: actionType.UPDATE_VERSION_SETTINGS_SUCCESS });
    yield call(fetchProjects);
    yield call(router.push, `project/${projectId}`);
  } catch (error) {
    yield put({ type: actionType.UPDATE_VERSION_SETTINGS_ERROR, error: error.response.data });
  }
}

export function* watchFetchProjects(): Generator<*, *, *> {
  yield call(takeLatest, actionType.FETCH_PROJECTS, fetchProjects);
}

export function* watchEnsureProjects(): Generator<*, *, *> {
  yield call(takeLatest, actionType.ENSURE_PROJECTS, ensureProjects);
}

export function* watchCreateNewProject(): Generator<*, *, *> {
  yield call(takeLatest, actionType.CREATE_NEW_PROJECT, createNewProject);
}

export function* watchUpdateProject(): Generator<*, *, *> {
  yield call(takeLatest, actionType.UPDATE_PROJECT, updateProject);
}

export function* watchCreateNewVersion(): Generator<*, *, *> {
  yield call(takeLatest, actionType.CREATE_NEW_VERSION, createNewVersion);
}

export function* watchCreateNewVersionFrom(): Generator<*, *, *> {
  yield call(takeLatest, actionType.CREATE_NEW_VERSION_FROM, createNewVersionFrom);
}

export function* watchStartSimulation(): Generator<*, *, *> {
  yield call(takeLatest, actionType.START_SIMULATION, startSimulation);
}

export function* watchUpdateVersionSettings(): Generator<*, *, *> {
  yield call(takeLatest, actionType.UPDATE_VERSION_SETTINGS, updateVersionSettings);
}

export function* watchRunningSimulations(): Generator<*, *, *> {
  const projectIdsSelector = store => store.project.get('projectIds', List());
  const projectsSelector = store => store.project.get('projects', Map());
  for (;;) {
    try {
      yield call(delay, 5000);
      const projects = yield select(projectsSelector);
      const projectIds = yield select(projectIdsSelector);
      const isSimulationRunning = !projectIds.every((projectId) => {
        const project = projects.get(projectId);
        const lastVersionId = project.getIn(['project', 'versionIds'], List()).last();
        if (lastVersionId !== undefined) {
          const version = project.getIn(['versions', String(lastVersionId)]);
          if (version && (version.get('status') === 'running' || version.get('status') === 'pending')) {
            return false;
          }
        }
        return true;
      });
      if (isSimulationRunning) {
        yield call(fetchProjects);
      }
    } catch (error) {
      // ignore error
    }
  }
}

export default function* projectSaga(): Generator<*, *, *> {
  yield [
    fork(watchFetchProjects),
    fork(watchEnsureProjects),
    fork(watchCreateNewProject),
    fork(watchUpdateProject),
    fork(watchCreateNewVersion),
    fork(watchCreateNewVersionFrom),
    fork(watchStartSimulation),
    fork(watchUpdateVersionSettings),
    fork(watchRunningSimulations),
  ];
}
