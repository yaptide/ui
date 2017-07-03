/* @flow */

import { Map } from 'immutable';
import * as _ from 'lodash';
import type { ProjectState, Project } from 'model/project';

export const actionType = {
  FETCH_PROJECTS: 'FETCH_PROJECTS',
  FETCH_PROJECTS_SUCCESS: 'FETCH_PROJECTS_SUCCESS',
  FETCH_PROJECTS_ERROR: 'FETCH_PROJECTS_ERROR',

  CREATE_NEW_PROJECT: 'CREATE_NEW_PROJECT',
  CREATE_NEW_PROJECT_SUCCESS: 'CREATE_NEW_PROJECT_SUCCESS',
  CREATE_NEW_PROJECT_ERROR: 'CREATE_NEW_PROJECT_ERROR',

  UPDATE_PROJECT: 'UPDATE_PROJECT',
  UPDATE_PROJECT_SUCCESS: 'UPDATE_PROJECT_SUCCESS',
  UPDATE_PROJECT_ERROR: 'UPDATE_PROJECT_ERROR',

  CREATE_NEW_VERSION: 'CREATE_NEW_VERSION',
  CREATE_NEW_VERSION_SUCCESS: 'CREATE_NEW_VERSION_SUCCESS',
  CREATE_NEW_VERSION_ERROR: 'CREATE_NEW_VERSION_ERROR',

  CREATE_NEW_VERSION_FROM: 'CREATE_NEW_VERSION_FROM',
  CREATE_NEW_VERSION_FROM_SUCCESS: 'CREATE_NEW_VERSION_FROM_SUCCESS',
  CREATE_NEW_VERSION_FROM_ERROR: 'CREATE_NEW_VERSION_FROM_ERROR',
};

const ACTION_HANDLERS = {
  [actionType.FETCH_PROJECTS]: (state: ProjectState) => {
    return state.set('isFetchProjectsPending', true);
  },
  [actionType.FETCH_PROJECTS_SUCCESS]: (state: ProjectState, action: Object) => {
    return state.merge({
      isFetchProjectsPending: false,
      projectIds: _.map(action.projects, item => item.id),
      projects: _.keyBy(action.projects, item => item.id),
    });
  },
  [actionType.FETCH_PROJECTS_ERROR]: (state: ProjectState, action: Object) => {
    return state.merge({ isFetchProjectsPending: false, fetchProjectsError: action.error });
  },

  [actionType.CREATE_NEW_PROJECT]: (state: ProjectState) => {
    return state.set('isCreateNewProjectPending', true);
  },
  [actionType.CREATE_NEW_PROJECT_SUCCESS]: (state: ProjectState) => {
    return state.merge({ isCreateNewProjectPending: false });
  },
  [actionType.CREATE_NEW_PROJECT_ERROR]: (state: ProjectState, action: Object) => {
    return state.merge({ isCreateNewProjectPending: false, newProjectError: action.error });
  },

  [actionType.UPDATE_PROJECT]: (state: ProjectState) => {
    return state.set('isUpdateProjectPending', true);
  },
  [actionType.UPDATE_PROJECT_SUCCESS]: (state: ProjectState) => {
    return state.merge({ isUpdateProjectPending: false });
  },
  [actionType.UPDATE_PROJECT_ERROR]: (state: ProjectState, action: Object) => {
    return state.merge({ isUpdateProjectPending: false, updateError: action.error });
  },


  [actionType.CREATE_NEW_VERSION]: (state: ProjectState) => {
    return state.set('isCreateNewVersionPending', true);
  },
  [actionType.CREATE_NEW_VERSION_SUCCESS]: (state: ProjectState) => {
    return state.merge({ isCreateNewVersionPending: false });
  },
  [actionType.CREATE_NEW_VERSION_ERROR]: (state: ProjectState, action: Object) => {
    return state.merge({ isCreateNewVersionPending: false, newVersionError: action.error });
  },

  [actionType.CREATE_NEW_VERSION_FROM]: (state: ProjectState) => {
    return state.set('isCreateNewVersionFromPending', true);
  },
  [actionType.CREATE_NEW_VERSION_FROM_SUCCESS]: (state: ProjectState) => {
    return state.merge({ isCreateNewVersionFromPending: false });
  },
  [actionType.CREATE_NEW_VERSION_FROM_ERROR]: (state: ProjectState, action: Object) => {
    return state.merge({ isCreateNewVersionFromPending: false, newVersionFromError: action.error });
  },
};

export const actionCreator = {
  fetchProjects() {
    return { type: actionType.FETCH_PROJECTS };
  },
  createNewProject(project: Project) {
    return { type: actionType.CREATE_NEW_PROJECT, project };
  },
  updateProject(project: Project, projectId: string) {
    return { type: actionType.UPDATE_PROJECT, project, projectId };
  },
  createNewVersion(projectId: string) {
    return { type: actionType.CREATE_NEW_VERSION, projectId };
  },
  createNewVersionFrom(projectId: string, versionId: number) {
    return { type: actionType.CREATE_NEW_VERSION_FROM, projectId, versionId };
  },
};

const initialState = Map();
export const reducer = (state: ProjectState = initialState, action: { type: string }) => {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
};
