/* @flow */

import { combineReducers } from 'redux';
import { Map } from 'immutable';

import { routerReducer as routing } from 'react-router-redux';
import { i18nReducer as i18n } from 'react-redux-i18n';

import { reducer as auth } from '../routes/Auth/reducer';
import { reducer as workspace } from '../routes/Workspace/reducer';
import { reducer as results } from '../routes/Results/reducer';
import { reducer as project } from '../routes/Project/reducer';

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
  auth: Map<string, any>,
  workspace: Map<string, any>,
  results: Map<string, any>,
  project: Map<string, any>,
};

export default rootReducer;
