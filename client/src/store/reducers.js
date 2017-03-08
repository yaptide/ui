/* @flow */

import { combineReducers } from 'redux';

import { routerReducer as routing } from 'react-router-redux';
import { i18nReducer as i18n } from 'react-redux-i18n';

import { reducer as auth } from '../routes/Auth/reducer';
import { reducer as workspace } from '../routes/Workspace/reducer';
import { reducer as results } from '../routes/Results/reducer';
import { reducer as project } from '../routes/Project/reducer';

import type { AuthState } from '../routes/Auth/model';
import type { WorkspaceState } from '../routes/Workspace/model';
import type { ResultsState } from '../routes/Results/model';
import type { ProjectState } from '../routes/Project/model';

const rootReducer = combineReducers({
  routing,
  i18n,
  auth,
  workspace,
  results,
  project,
});

export type Store = {
  routing: Object,
  i18n: Object,
  auth: AuthState,
  workspace: WorkspaceState,
  results: ResultsState,
  project: ProjectState,
};

export default rootReducer;
