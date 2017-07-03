/* @flow */

import { takeLatest } from 'redux-saga';
import { fork, call, put } from 'redux-saga/effects';
import api, { endpoint } from 'api';
import router from 'utils/router';
import type { Project } from 'model/project';
import { actionType } from './reducer';

export function* fetchProjects(): Generator<*, *, *> {
  try {
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
    yield call(fetchProjects); // TODO: better solution possible
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

export function* watchFetchProjects(): Generator<*, *, *> {
  yield call(takeLatest, actionType.FETCH_PROJECTS, fetchProjects);
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

export default function* projectSaga(): Generator<*, *, *> {
  yield [
    fork(watchFetchProjects),
    fork(watchCreateNewProject),
    fork(watchUpdateProject),
    fork(watchCreateNewVersion),
    fork(watchCreateNewVersionFrom),
  ];
}
